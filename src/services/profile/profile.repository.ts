import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Logger } from 'nestjs-pino';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { CountryCode } from 'src/drizzle/schema/country-code.schema';
import { profileTable } from 'src/drizzle/schema/profile.schema';

@Injectable()
export class ProfileRepository {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly logger: Logger,
  ) {}

  async getProfile(userId: number) {
    try {
      const profile = await this.drizzle.db
        .select()
        .from(profileTable)
        .where(eq(profileTable.userId, userId));

      if (profile.length === 0) {
        throw new NotFoundException('User Profile not found');
      }
      return profile[0];
    } catch (error) {
      throw new BadRequestException('Error featching profile', error);
    }
  }

  async getCountriesData() {
    return await this.drizzle.db.select().from(CountryCode);
  }
}
