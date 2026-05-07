import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { v4 as uuidv4 } from 'uuid';

// 模拟验证码存储（生产环境应使用Redis）
const codeStore = new Map<string, { code: string; expiresAt: Date }>();

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // 发送验证码
  async sendCode(phone: string): Promise<{ success: boolean; message: string }> {
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟过期

    // 存储验证码
    codeStore.set(phone, { code, expiresAt });

    console.log(`[模拟] 验证码 ${code} 已发送到手机 ${phone}`);

    return {
      success: true,
      message: '验证码已发送',
    };
  }

  // 登录
  async login(
    phone: string,
    code: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
  }> {
    // 验证验证码
    const stored = codeStore.get(phone);
    if (!stored || stored.code !== code || stored.expiresAt < new Date()) {
      throw new Error('验证码错误或已过期');
    }

    // 清除验证码
    codeStore.delete(phone);

    // 查找或创建用户
    let user = await this.userService.findByPhone(phone);
    if (!user) {
      user = await this.userService.create({
        phone,
        nickname: `用户${phone.slice(-4)}`,
      });
    }

    // 生成Token
    const payload = { sub: user.id, phone: user.phone };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();

    // 存储刷新令牌
    await this.userService.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  // 刷新Token
  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.findByRefreshToken(refreshToken);
    if (!user) {
      throw new Error('无效的刷新令牌');
    }

    const payload = { sub: user.id, phone: user.phone };
    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = uuidv4();

    // 更新刷新令牌
    await this.userService.saveRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
