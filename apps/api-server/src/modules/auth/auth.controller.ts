import { FastifyReply, FastifyRequest } from 'fastify';
import { registerSchema, loginSchema } from '@queueflow/shared';
import { AuthService } from './auth.service.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    const body = registerSchema.parse(request.body);
    const user = await this.authService.register(body);

    const token = request.server.jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return reply.status(201).send({
      message: 'User registered successfully',
      user,
      accessToken: token,
    });
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = loginSchema.parse(request.body);
    const user = await this.authService.login(body);

    const token = request.server.jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return reply.status(200).send({
      message: 'Login successful',
      user,
      accessToken: token,
    });
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.userId;
    const profile = await this.authService.getUserProfile(userId);
    return reply.status(200).send({ user: profile });
  }
}
