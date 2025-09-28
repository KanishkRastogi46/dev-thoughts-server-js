import { BadRequestException, Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { profileTable } from 'src/drizzle/schema/profile.schema';
import { eq } from 'drizzle-orm';
import { postsTable } from 'src/drizzle/schema/posts.schema';

@Injectable()
export class HomeRepository {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly logger: Logger,
  ) {}

  async fetchHomeData(userId: number) {
    try {
      const country = await this.drizzle.db
        .select({ country: profileTable.country })
        .from(profileTable)
        .where(eq(profileTable.userId, userId));

      if (country.length === 0) {
        throw new BadRequestException('Country not found for the user');
      }

      const posts = await this.drizzle.db
        .select({
          postId: postsTable.id,
          profileId: postsTable.profile,
          category: postsTable.category,
          title: postsTable.title,
          text: postsTable.text,
          media: postsTable.media,
          country: profileTable.country,
          createdAt: postsTable.createdAt,
        })
        .from(postsTable)
        .innerJoin(profileTable, eq(postsTable.profile, profileTable.id))
        .where(eq(profileTable.country, country[0].country))
        .orderBy(postsTable.createdAt)
        .limit(20);

      return posts;
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }
}
