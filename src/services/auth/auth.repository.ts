import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { and, eq, ne, or, sql } from "drizzle-orm";
import { DrizzleService } from "src/drizzle/drizzle.service";
import { userTable } from "src/drizzle/schema/users.schema";
import { otp } from "src/drizzle/schema/otp.schema";
import { email } from "zod";


@Injectable()
export class AuthRepository {
    constructor(
        private readonly drizzle: DrizzleService
    ) {}

    async getUserById(id: number) {
        return await this.drizzle.db
                    .select({
                        id: userTable.id,
                        email: userTable.email,
                        role: userTable.role,
                    })
                    .from(userTable)
                    .where(
                        eq(userTable.id, id)
                    )
                    .limit(1)
    }

    async findUserByEmailOrUsername(email: string, username: string) {
        return await this.drizzle.db
                    .select()
                    .from(userTable)
                    .where(
                        or(
                            eq(userTable.email, email),
                            eq(userTable.username, username)
                        )
                    )
                    .limit(1)
    }

    async findUser(identifier: string) {
        return await this.drizzle.db
                    .select()
                    .from(userTable)
                    .where(
                        or(
                            eq(userTable.email, identifier),
                            eq(userTable.username, identifier)
                        )
                    )
                    .limit(1)
    }

    async createNewUser(user) {
        return await this.drizzle.db.insert(userTable).values(user).returning({ id: userTable.id })
    }

    async updatedLastLogin(id: number, lastLogin: Date) {
        await this.drizzle.db
            .update(userTable)
            .set({ lastLogin })
            .where(eq(userTable.id, id))
    }

    async updatePassword(id: number, password: string) {
        await this.drizzle.db
            .update(userTable)
            .set({ 
                password, updatedAt: new Date() 
            })
            .where(
                eq(userTable.id, id)
            )
    }

    async createOtp(otpValue: string, userId: number, reason: string) {
        try {
            const checkOtp =  await this.drizzle.db
                            .select({
                                otp: otp.otp,
                                expiresAt: otp.expiresAt,
                            })
                            .from(otp)
                            .where(
                                eq(otp.user, userId)
                            )
            
            if (checkOtp.length > 0) {
                if (checkOtp[0].otp === '' || (checkOtp[0].expiresAt && checkOtp[0].expiresAt.getTime() < Date.now())) {
                    return await this.drizzle.db
                        .update(otp)
                        .set({ 
                            otp: otpValue, 
                            status: 'pending', 
                            reason,
                            attempts: 1,
                            expiresAt: new Date(Date.now() + 5 * 60 * 1000), 
                            updatedAt: new Date(), 
                            lastOtpTime: new Date() 
                        })
                        .where(
                            eq(otp.user, userId)
                        )
                        .returning({ otp: otp.otp })
                }
                else throw new BadRequestException('Otp already sent, please check your email')
            } 
    
            return await this.drizzle.db
                    .insert(otp)
                    .values({
                        otp: otpValue,
                        user: userId,
                        reason,
                        status: 'pending',
                        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // otp valid for 5 minutes
                        lastOtpTime: new Date()
                    })
                    .returning({ otp: otp.otp })
        } catch (error) {
            throw new HttpException("Error creating OTP", 400)
        }
    }

    async getOtp(userId: number) {
        try {
            const result = await this.drizzle.db
                        .select({ 
                            otp: otp.otp,
                            expiresAt: otp.expiresAt
                        })
                        .from(otp)
                        .where(
                            and(
                                eq(otp.user, userId)
                            )
                        )
            
            if (result.length === 0) {
                throw new HttpException('No otp found', HttpStatus.NOT_FOUND)
            }
            
            if (result[0].otp === '') {
                throw new BadRequestException('Otp already used or expired')
            }
            if (result[0].expiresAt.getTime() < Date.now()) {
                await this.drizzle.db
                    .update(otp)
                    .set({ otp: '', status: 'expired', expiresAt: null, updatedAt: new Date() })
                throw new BadRequestException('Otp expired')
            }
    
            await this.drizzle.db
                    .update(otp)
                    .set({ otp: '', status: 'completed', expiresAt: null, updatedAt: new Date() })
            return result[0].otp
        } catch (error) {
            throw new HttpException("Otp expired", error.status || 500)
        }
    }

    async canResendOtp(userId: number) {
        try {
            const result = await this.drizzle.db
                        .select()
                        .from(otp)
                        .where(
                            eq(otp.user, userId)
                        )
                        .limit(1)
            if (result.length === 0) {
                throw new BadRequestException("No otp found")
            }
            const attempts = result[0].attempts
            const lastOtpTime = result[0].lastOtpTime.getTime()

            const oneHourBuffer = 60 * 60 * 1000
            const twoMinBuffer = 2 * 60 * 1000

            // check whether otp is not requested before 2 mins
            if (lastOtpTime + twoMinBuffer > Date.now()) return false

            // check if the number of attempts is 3 then the otp should be resend after 1 hr
            if (attempts === 3) {
                if (lastOtpTime + oneHourBuffer < Date.now()) return true
                else return false
            }
            else if (attempts < 3) return true
            else return false

        } catch (error) {
            throw new HttpException(error.message, error.status || 500)
        }
    }

    async resendOtp(userId: number, otpValue: string) {
        return await this.drizzle.db
                .update(otp)
                .set({
                    otp: otpValue, 
                    status: 'pending', 
                    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                    updatedAt: new Date(),
                    lastOtpTime: new Date(),
                    attempts: sql`${otp.attempts} + 1`
                })
                .where(
                    eq(otp.user, userId)
                )
                .returning({ otp: otp.otp })
    }
}
