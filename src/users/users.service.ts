import {Injectable, NotFoundException, Inject, forwardRef} from '@nestjs/common';
import {PrismaService} from "../prisma.service";
import {User} from '@prisma/client';
import {RegisterUserDto} from "./dto/register-user.dto";
import {AddProjectsDto} from "./dto/add-projects.dto";
import * as bcrypt from 'bcrypt';
import {AuthService} from "../auth/auth.service";


@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => AuthService))
        private authService: AuthService
    ) {
    }

    async getUsers(): Promise<User[]> {
        return this.prisma.user.findMany()
    }

    async getUser(username: string): Promise<User> {
        return this.prisma.user.findUnique({where: {username}})
    }

    async  getUserByToken(accessToken: string): Promise<User> {
        return this.prisma.user.findUnique({where: {accessToken}})
    }

    async signUp(body: RegisterUserDto): Promise<User> {
        const saltRounds = 10;
        const hash = await bcrypt.hash(body.password, saltRounds)
        return this.prisma.user.create({
            data: {
                username: body.username,
                password: hash,
                email: body.email,
            }
        })
    }

    async login(user: User): Promise<any> {
        return this.authService.login(user)
    }

    async logout(username: string): Promise<void> {
        await this.prisma.user.update({
            where: {
                username
            },
            data: {
                accessToken: null
            }
        })
    }

    async addProject(body: AddProjectsDto): Promise<void> {
        try {
            await this.prisma.user.update({
                where: {email: body.email},
                data: {
                    projects: {
                        connect: body.projectsId
                    }
                }

            });
        } catch (e) {
            throw e;
        }
    }

    async refreshToken(accessToken: string, refreshToken: string) {
        return this.authService.refreshToken(accessToken, refreshToken)
    }

    async addAccessToken(username: string, accessToken: string): Promise<void> {
        try {
            await this.prisma.user.update({
                where: {username: username},
                data: {
                    accessToken: accessToken
                }
            })
        } catch (e) {
            throw new NotFoundException();
        }
    }
}
