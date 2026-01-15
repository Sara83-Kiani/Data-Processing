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

  private async hasUsedDiscount(accountId: number): Promise<boolean> {
    const c = await this.invitationRepo.count({
      where: [
        { inviterAccountId: accountId, discountApplied: true } as any,
        { inviteeAccountId: accountId, discountApplied: true } as any,
      ],
    });
    return c > 0;
  }

  private async applyDiscountForInvitePair(invitation: Invitation) {
    // fixed temporary monthly discount (amount). adjust as you like.
    const DISCOUNT_AMOUNT = 2.0; // €2 / $2 off
    const VALID_DAYS = 90; // 3 months

    const inviterId = invitation.inviterAccountId;
    const inviteeId = invitation.inviteeAccountId!;
    if (!inviterId || !inviteeId) return;

    // only once per account
    if (await this.hasUsedDiscount(inviterId)) return;
    if (await this.hasUsedDiscount(inviteeId)) return;

    const inviter = await this.accountRepo.findOne({ where: { accountId: inviterId }, relations: ['subscription'] });
    const invitee = await this.accountRepo.findOne({ where: { accountId: inviteeId }, relations: ['subscription'] });
    if (!inviter?.subscription || !invitee?.subscription) return;

    const validUntil = new Date(Date.now() + VALID_DAYS * 24 * 60 * 60 * 1000);

    inviter.subscription.discountAmount = DISCOUNT_AMOUNT.toFixed(2);
    inviter.subscription.discountValidUntil = validUntil;

    invitee.subscription.discountAmount = DISCOUNT_AMOUNT.toFixed(2);
    invitee.subscription.discountValidUntil = validUntil;

    await this.subRepo.save([inviter.subscription, invitee.subscription]);

    invitation.discountApplied = true;
    await this.invitationRepo.save(invitation);
  }

  async subscribe(accountId: number, dto: SubscribeDto) {
    const account = await this.accountRepo.findOne({ where: { accountId } });
    if (!account) throw new BadRequestException('Account not found');

    const previousSubscriptionId = account.subscriptionId;

    const quality = dto.quality;
    const plan = this.planInfo(quality);

    const now = new Date();

    // Trial logic: first time only
    const isTrial = !account.isTrialUsed;
    const trialStart = isTrial ? now : null;
    const trialEnd = isTrial ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

    const sub = await this.accountRepo.manager.transaction(async (manager) => {
      const txSubRepo = manager.getRepository(Subscription);
      const txAccountRepo = manager.getRepository(Account);

      const newSub = await txSubRepo.save(
        txSubRepo.create({
          description: plan.desc,
          price: plan.price,
          quality,
          isTrial,
          trialStartDate: trialStart,
          trialEndDate: trialEnd,
          discountAmount: '0.00',
          discountValidUntil: null,
          startDate: now,
          endDate: null,
          status: 'ACTIVE',
        }),
      );

      account.subscriptionId = newSub.subscriptionId;
      account.paymentMethod = dto.paymentMethod ?? account.paymentMethod ?? null;
      if (isTrial) account.isTrialUsed = true;

      await txAccountRepo.save(account);

      if (previousSubscriptionId) {
        const stillUsed = await txAccountRepo.count({ where: { subscriptionId: previousSubscriptionId } });
        if (stillUsed === 0) {
          await txSubRepo.delete({ subscriptionId: previousSubscriptionId });
        }
      }

      return newSub;
    });

    // Apply discount only when it's NOT trial (paid subscription)
    if (!sub.isTrial) {
      const inv = await this.invitationRepo.findOne({
        where: {
          inviteeAccountId: accountId,
          status: 'ACCEPTED' as any,
          discountApplied: false,
        } as any,
      });

      if (inv) await this.applyDiscountForInvitePair(inv);
    }

    return {
      message: isTrial
        ? 'Trial started (7 days).'
        : 'Subscription activated.',
      subscription: sub,
    };
  }
}
