import { Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getCountryList() {
    return await this.profileRepository.getCountriesData();
  }
}
