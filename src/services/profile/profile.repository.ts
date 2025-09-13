import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { CountryCode } from 'src/drizzle/schema/country-code.schema';

@Injectable()
export class ProfileRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async getCountriesData() {
    return await this.drizzle.db.select().from(CountryCode);
  }
}
