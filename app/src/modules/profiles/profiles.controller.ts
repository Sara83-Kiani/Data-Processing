import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SetPreferencesDto } from './dto/set-preferences.dto';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  list(@Req() req: any) {
    return this.profilesService.listByAccount(Number(req.user.sub));
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateProfileDto) {
    return this.profilesService.create(Number(req.user.sub), dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.profilesService.update(Number(req.user.sub), Number(id), dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.profilesService.remove(Number(req.user.sub), Number(id));
  }

  @Get(':id/preferences')
  getPrefs(@Req() req: any, @Param('id') id: string) {
    return this.profilesService.getPreferences(Number(req.user.sub), Number(id));
  }

  @Put(':id/preferences')
  setPrefs(@Req() req: any, @Param('id') id: string, @Body() dto: SetPreferencesDto) {
    return this.profilesService.setPreferences(Number(req.user.sub), Number(id), dto);
  }
}
