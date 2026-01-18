import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { Account } from '../accounts/entities/accounts.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subRepo: Repository<Subscription>,

    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,

    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
  ) {}

  async mySubscription(accountId: number) {
    const account = await this.accountRepo.findOne({
      where: { accountId },
      relations: ['subscription'],
    });

    return {
      account: {
        accountId: account?.accountId,
        email: account?.email,
        isTrialUsed: account?.isTrialUsed,
      },
      subscription: account?.subscription ?? null,
    };
  }

  private planInfo(quality: 'SD' | 'HD' | 'UHD') {
    if (quality === 'SD') return { price: 7.99, desc: 'Basic SD - Standard Definition streaming' };
    if (quality === 'HD') return { price: 12.99, desc: 'Standard HD - High Definition streaming' };
    return { price: 17.99, desc: 'Premium UHD - Ultra HD streaming' };
  }

  private referralDiscountAmount(): number {
    const n = Number(process.env.REFERRAL_DISCOUNT_AMOUNT ?? 2);
    return Number.isFinite(n) && n > 0 ? n : 2;
  }

  private referralDiscountDays(): number {
    const n = Number(process.env.REFERRAL_DISCOUNT_DAYS ?? 30);
    return Number.isFinite(n) && n > 0 ? n : 30;
  }

  private addDays(d: Date, days: number): Date {
    return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private async hasUsedDiscountTx(invitationRepo: Repository<Invitation>, accountId: number): Promise<boolean> {
    const c = await invitationRepo.count({
      where: [
        { inviterAccountId: accountId, discountApplied: true } as any,
        { inviteeAccountId: accountId, discountApplied: true } as any,
      ],
    });
    return c > 0;
  }

  private async activeReferralDiscountForAccountTx(
    invitationRepo: Repository<Invitation>,
    accountId: number,
    now: Date,
  ): Promise<{ amount: string; validUntil: Date } | null> {
    const inv = await invitationRepo.findOne({
      where: [
        {
          inviterAccountId: accountId,
          discountApplied: true,
        } as any,
        {
          inviteeAccountId: accountId,
          discountApplied: true,
        } as any,
      ],
      order: { invitationId: 'DESC' as any },
    });

    if (!inv?.discountValidUntil) return null;
    if (inv.discountValidUntil.getTime() <= now.getTime()) return null;
    if (!inv.discountAmount || Number(inv.discountAmount) <= 0) return null;

    return { amount: Number(inv.discountAmount).toFixed(2), validUntil: inv.discountValidUntil };
  }

  async subscribe(accountId: number, dto: SubscribeDto) {
    const quality = dto.quality;
    const plan = this.planInfo(quality);

    const now = new Date();

    return this.accountRepo.manager.transaction(async (manager) => {
      const txSubRepo = manager.getRepository(Subscription);
      const txAccountRepo = manager.getRepository(Account);
      const txInvitationRepo = manager.getRepository(Invitation);

      const account = await txAccountRepo.findOne({ where: { accountId } });
      if (!account) throw new BadRequestException('Account not found');

      const previousSubscriptionId = account.subscriptionId;

      // Trial logic: first time only
      const isInvitedAccount = !!account.referredByAccountId;
      const isTrial = !account.isTrialUsed && !isInvitedAccount;
      const trialStart = isTrial ? now : null;
      const trialEnd = isTrial ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

      // If the account already has an active referral discount window, preserve it
      const existingDiscount = await this.activeReferralDiscountForAccountTx(txInvitationRepo, accountId, now);

      // If this is a paid subscription for an invitee, try to activate the invitation discount window
      let activatedDiscount: { amount: string; validUntil: Date } | null = null;

      if (!isTrial) {
        const inv = await txInvitationRepo.findOne({
          where: {
            inviteeAccountId: accountId,
            status: 'ACCEPTED' as any,
            discountApplied: false,
          } as any,
        });

        if (inv) {
          const inviterId = inv.inviterAccountId;
          const inviteeId = inv.inviteeAccountId;

          if (!inviterId || !inviteeId) {
            inv.status = 'EXPIRED';
            await txInvitationRepo.save(inv);
          } else {
            const inviterUsed = await this.hasUsedDiscountTx(txInvitationRepo, inviterId);
            const inviteeUsed = await this.hasUsedDiscountTx(txInvitationRepo, inviteeId);

            if (inviterUsed || inviteeUsed) {
              inv.status = 'EXPIRED';
              await txInvitationRepo.save(inv);
            } else {
              const amount = this.referralDiscountAmount();
              const validUntil = this.addDays(now, this.referralDiscountDays());

              inv.discountApplied = true;
              inv.discountAmount = amount.toFixed(2);
              inv.discountStartedAt = now;
              inv.discountValidUntil = validUntil;

              await txInvitationRepo.save(inv);

              activatedDiscount = { amount: amount.toFixed(2), validUntil };

              // Apply to inviter's current subscription if they have one (if not, it will be applied on their next subscribe during the window)
              const inviter = await txAccountRepo.findOne({ where: { accountId: inviterId } });
              if (inviter?.subscriptionId) {
                const inviterSub = await txSubRepo.findOne({ where: { subscriptionId: inviter.subscriptionId } });
                if (inviterSub) {
                  inviterSub.discountAmount = activatedDiscount.amount;
                  inviterSub.discountValidUntil = activatedDiscount.validUntil;
                  await txSubRepo.save(inviterSub);
                }
              }
            }
          }
        }
      }

      const discountToApply = activatedDiscount ?? existingDiscount;

      const newSub = await txSubRepo.save(
        txSubRepo.create({
          description: plan.desc,
          price: plan.price,
          quality,
          isTrial,
          trialStartDate: trialStart,
          trialEndDate: trialEnd,
          discountAmount: discountToApply ? discountToApply.amount : '0.00',
          discountValidUntil: discountToApply ? discountToApply.validUntil : null,
          startDate: now,
          endDate: null,
          status: 'ACTIVE',
        }),
      );

      account.subscriptionId = newSub.subscriptionId;
      account.paymentMethod = dto.paymentMethod ?? account.paymentMethod ?? null;
      if (isTrial || isInvitedAccount) account.isTrialUsed = true;

      await txAccountRepo.save(account);

      if (previousSubscriptionId) {
        const stillUsed = await txAccountRepo.count({ where: { subscriptionId: previousSubscriptionId } });
        if (stillUsed === 0) {
          await txSubRepo.delete({ subscriptionId: previousSubscriptionId });
        }
      }

      return {
        message: isTrial ? 'Trial started (7 days).' : 'Subscription activated.',
        subscription: newSub,
      };
    });
  }
}
