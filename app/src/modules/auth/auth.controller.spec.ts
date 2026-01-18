import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    activateAccount: jest.fn(),
    getActivatedRedirectUrl: jest.fn().mockReturnValue('http://localhost:5173/activated'),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with correct DTO', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'Test123456',
      };

      mockAuthService.register.mockResolvedValue({ success: true, message: 'User registered' });

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ success: true, message: 'User registered' });
    });
  });

  describe('login', () => {
    it('should call authService.login with correct DTO', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'Test123456',
      };

      mockAuthService.login.mockResolvedValue({
        success: true,
        accessToken: 'jwt-token',
        expiresIn: '24h',
      });

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        success: true,
        accessToken: 'jwt-token',
        expiresIn: '24h',
      });
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword with correct DTO', async () => {
      const dto: ForgotPasswordDto = { email: 'test@example.com' };

      mockAuthService.forgotPassword.mockResolvedValue({
        success: true,
        message: 'Password reset email sent',
      });

      const result = await controller.forgotPassword(dto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ success: true, message: 'Password reset email sent' });
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword with correct DTO', async () => {
      const dto: ResetPasswordDto = {
        token: 'reset-token',
        newPassword: 'NewTest123456',
      };

      mockAuthService.resetPassword.mockResolvedValue({
        success: true,
        message: 'Password reset successfully',
      });

      const result = await controller.resetPassword(dto);

      expect(authService.resetPassword).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ success: true, message: 'Password reset successfully' });
    });
  });
});
