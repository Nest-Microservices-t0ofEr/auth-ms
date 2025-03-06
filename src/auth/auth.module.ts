import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { NatsModule } from 'src/transport/nats.module';
import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config/envs';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
  imports: [
    NatsModule,
    JwtModule.register({
      global: true,
      secret: envs.jwtSecret,
      signOptions: { expiresIn: '2h' },
    })
  ]
})
export class AuthModule {}
