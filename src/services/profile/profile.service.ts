import { BadRequestException, Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { Logger } from 'nestjs-pino';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly logger: Logger,
  ) {}

  async getCountryList() {
    return await this.profileRepository.getCountriesData();
  }

  async getProfile(userId: number) {
    try {
      const profile = await this.profileRepository.getProfile(userId);
      return profile;
    } catch (error) {
      this.logger.error('Error fetching profile', { error });
      throw new BadRequestException('Could not fetch profile');
    }
  }
}
