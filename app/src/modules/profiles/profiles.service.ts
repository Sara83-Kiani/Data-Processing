import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { ProfilePreference } from './entities/profile-preference.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SetPreferencesDto } from './dto/set-preferences.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile) private readonly profileRepo: Repository<Profile>,
    @InjectRepository(ProfilePreference) private readonly prefRepo: Repository<ProfilePreference>,
  ) {}

  listByAccount(accountId: number) {
    return this.profileRepo.find({ where: { accountId } });
  }

  async create(accountId: number, dto: CreateProfileDto) {
    const p = this.profileRepo.create({
      accountId,
      name: dto.name,
      age: dto.age ?? 18,
      language: dto.language ?? 'ENGLISH',
    });
    return this.profileRepo.save(p);
  }

  private async mustOwnProfile(accountId: number, profileId: number) {
    const p = await this.profileRepo.findOne({ where: { profileId } });
    if (!p) throw new NotFoundException('Profile not found');
    if (p.accountId !== accountId) throw new ForbiddenException('Not allowed');
    return p;
  }

  async update(accountId: number, profileId: number, dto: UpdateProfileDto) {
    const p = await this.mustOwnProfile(accountId, profileId);
    Object.assign(p, dto);
    return this.profileRepo.save(p);
  }

  async remove(accountId: number, profileId: number) {
    await this.mustOwnProfile(accountId, profileId);
    await this.profileRepo.delete({ profileId });
    return { message: 'Profile deleted' };
  }

  async getPreferences(accountId: number, profileId: number) {
    await this.mustOwnProfile(accountId, profileId);
    const rows = await this.prefRepo.find({ where: { profileId } });
    return rows.map((r) => ({ genreId: r.genreId, classificationId: r.classificationId }));
  }

  async setPreferences(accountId: number, profileId: number, dto: SetPreferencesDto) {
    await this.mustOwnProfile(accountId, profileId);

    await this.prefRepo.delete({ profileId });

    if (!dto.items?.length) return { message: 'Preferences cleared' };

    const rows = dto.items.map((it) =>
      this.prefRepo.create({
        profileId,
        genreId: it.genreId,
        classificationId: it.classificationId,
      }),
    );

    await this.prefRepo.save(rows);
    return { message: 'Preferences updated' };
  }
}
