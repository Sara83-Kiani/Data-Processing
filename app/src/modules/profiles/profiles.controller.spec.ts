import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let service: ProfilesService;
  let mockRequest: any;

  const mockProfilesService = {
    listByAccount: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getPreferences: jest.fn(),
    setPreferences: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        {
          provide: ProfilesService,
          useValue: mockProfilesService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ProfilesController>(ProfilesController);
    service = module.get<ProfilesService>(ProfilesService);

    mockRequest = { user: { sub: 1 } };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should return profiles for the authenticated account', async () => {
      const profiles = [{ profile_id: 1, name: 'Profile 1' }];
      mockProfilesService.listByAccount.mockResolvedValue(profiles);

      const result = await controller.list(mockRequest);

      expect(service.listByAccount).toHaveBeenCalledWith(1);
      expect(result).toEqual(profiles);
    });
  });

  describe('create', () => {
    it('should create a profile for the authenticated account', async () => {
      const dto = { name: 'New Profile', age: 25, language: 'ENGLISH' as const };
      const created = { profile_id: 2, ...dto };
      mockProfilesService.create.mockResolvedValue(created);

      const result = await controller.create(mockRequest, dto);

      expect(service.create).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update a profile', async () => {
      const dto = { name: 'Updated Profile' };
      const updated = { profile_id: 1, ...dto };
      mockProfilesService.update.mockResolvedValue(updated);

      const result = await controller.update(mockRequest, '1', dto);

      expect(service.update).toHaveBeenCalledWith(1, 1, dto);
      expect(result).toEqual(updated);
    });

    it('should propagate NotFoundException from service', async () => {
      mockProfilesService.update.mockRejectedValue(
        new NotFoundException('Profile not found'),
      );

      await expect(controller.update(mockRequest, '999', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate ForbiddenException from service', async () => {
      mockProfilesService.update.mockRejectedValue(
        new ForbiddenException('Access denied'),
      );

      await expect(controller.update(mockRequest, '2', {})).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a profile', async () => {
      mockProfilesService.remove.mockResolvedValue(undefined);

      await controller.remove(mockRequest, '1');

      expect(service.remove).toHaveBeenCalledWith(1, 1);
    });

    it('should propagate NotFoundException from service', async () => {
      mockProfilesService.remove.mockRejectedValue(
        new NotFoundException('Profile not found'),
      );

      await expect(controller.remove(mockRequest, '999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPrefs', () => {
    it('should return profile preferences', async () => {
      const prefs = { genre_id: 1, classification_id: 1 };
      mockProfilesService.getPreferences.mockResolvedValue(prefs);

      const result = await controller.getPrefs(mockRequest, '1');

      expect(service.getPreferences).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(prefs);
    });

    it('should propagate NotFoundException from service', async () => {
      mockProfilesService.getPreferences.mockRejectedValue(
        new NotFoundException('Profile not found'),
      );

      await expect(controller.getPrefs(mockRequest, '999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setPrefs', () => {
    it('should set profile preferences', async () => {
      const dto = { items: [{ genreId: 2, classificationId: 2 }] };
      mockProfilesService.setPreferences.mockResolvedValue(undefined);

      await controller.setPrefs(mockRequest, '1', dto);

      expect(service.setPreferences).toHaveBeenCalledWith(1, 1, dto);
    });

    it('should propagate NotFoundException from service', async () => {
      mockProfilesService.setPreferences.mockRejectedValue(
        new NotFoundException('Profile not found'),
      );

      await expect(controller.setPrefs(mockRequest, '999', { items: [] })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
