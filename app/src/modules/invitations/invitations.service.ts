import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Invitation } from './entities/invitation.entity';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
  ) {}

  async create(inviterAccountId: number, inviteeEmail: string) {
    const code = `INV-${randomUUID().slice(0, 8).toUpperCase()}`;
    const row = this.invitationRepo.create({
      inviterAccountId,
      inviteeEmail: inviteeEmail.trim().toLowerCase(),
      inviteeAccountId: null,
      invitationCode: code,
      acceptedAt: null,
      discountApplied: false,
      status: 'PENDING',
      createdAt: new Date(),
    });

    const saved = await this.invitationRepo.save(row);

    // Frontend will use this to prefill register?code=...
    return {
      invitationCode: saved.invitationCode,
      registerUrl: `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/register?code=${encodeURIComponent(saved.invitationCode)}`,
    };
  }

  listSent(inviterAccountId: number) {
    return this.invitationRepo.find({
      where: { inviterAccountId },
      order: { createdAt: 'DESC' as any },
    });
  }
}
