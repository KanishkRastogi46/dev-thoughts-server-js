import { Injectable } from "@nestjs/common";
import { eq, or } from "drizzle-orm";
import { DrizzleService } from "src/drizzle/drizzle.service";
import { userTable } from "src/drizzle/schema/users.schema";


@Injectable()
export class AuthRepository {
    constructor(
        private readonly drizzle: DrizzleService
    ) {}
    async findUserByEmailOrUsername(email?: string, username?: string, identifier?: string) {
        if (identifier) {
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

    async createNewUser(user) {
        return await this.drizzle.db.insert(userTable).values(user).returning({ id: userTable.id })
    }

    async updatedLastLogin(id: number, lastLogin: Date) {
        await this.drizzle.db
            .update(userTable)
            .set({ lastLogin })
            .where(eq(userTable.id, id))
    }
}
