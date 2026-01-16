import { Injectable } from '@nestjs/common';
<<<<<<< HEAD
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Invitation } from './entities/invitation.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
    private readonly mailService: MailService,
  ) {}

  async create(inviterAccountId: number, inviteeEmail: string) {
    const code = `INV-${randomUUID().slice(0, 8).toUpperCase()}`;
    const row = this.invitationRepo.create({
      inviterAccountId,
      inviteeEmail: inviteeEmail.trim().toLowerCase(),
      inviteeAccountId: null,
      invitationCode: code,
      acceptedAt: null,
      discountAmount: '0.00',
      discountStartedAt: null,
      discountValidUntil: null,
      discountApplied: false,
      status: 'PENDING',
      createdAt: new Date(),
    });

    const saved = await this.invitationRepo.save(row);

    const registerUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/register?code=${encodeURIComponent(saved.invitationCode)}`;
    const emailSent = await this.mailService.sendInvitationEmail(saved.inviteeEmail, registerUrl);

    return {
      invitationCode: saved.invitationCode,
      emailSent,
    };
  }

  listSent(inviterAccountId: number) {
    return this.invitationRepo.find({
      where: { inviterAccountId },
      order: { createdAt: 'DESC' as any },
    });
  }
}
=======

@Injectable()
export class InvitationsService {}
>>>>>>> d503f7e7 (Add watchlist feature, content warnings, and UI improvements)
