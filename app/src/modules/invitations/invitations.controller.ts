import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Controller('invitations')
@UseGuards(JwtAuthGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateInvitationDto) {
    return this.invitationsService.create(Number(req.user.sub), dto.inviteeEmail);
  }

  @Get('me')
  listMine(@Req() req: any) {
    return this.invitationsService.listSent(Number(req.user.sub));
  }
}
