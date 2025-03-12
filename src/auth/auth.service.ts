import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RpcException } from '@nestjs/microservices';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config/envs';
@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async signJwt( payload: JwtPayload) {
        return this.jwtService.sign(payload);
    }
    async registerUser(registerUserDto: RegisterUserDto) {
        const { name, email, password } = registerUserDto;
        try {
            const user = await this.prisma.user.findUnique({where: {email}});
            if(user) {
                throw new RpcException({
                    error: 400,
                    message: 'User already exists'
                });
            }
            const newUser = await this.prisma.user.create({data: {
                    password: bcrypt.hashSync(password, 10), 
                    email, 
                    name
                }
            });
            const { password: __, ...rest} = newUser;
            return {
                user: rest,
                token: await this.signJwt(rest),
            };
        } catch (error) {
            throw new RpcException({
                code: 400,
                message: error.message,
            })
        }
    }
    async loginUser( loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;
        try {
            const user = await this.prisma.user.findUnique({where: {email}});
            if(!user) {
                throw new RpcException({
                    error: 400,
                    message: 'User does not exists',
                });
            }

            const isPasswordMatch = bcrypt.compareSync(password, user.password);
            if(!isPasswordMatch) {
                throw new RpcException({
                    error: 400,
                    message: 'User/Password not valid',
                });
            }

            const { password: __, ...rest} = user;
            return {
                user: user,
                token: await this.signJwt(rest),
            };
        } catch (error) {
            console.log(error);
            throw new RpcException({
                code: 400,
                message: error.message,
            })
        }
    }
    async verifyToken(token: string) {
        try {
            const { sub, iat, exp, ...user} = this.jwtService.verify(token, 
                { 
                    secret: envs.jwtSecret
                }
            );
            return {
                user,
                token: await this.signJwt(user),
            }
        } catch (error) {
            throw new RpcException({
                code: 401,
                message: 'Invalid token',
            })
            
        }
    }
}
