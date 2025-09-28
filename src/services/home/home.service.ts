import { BadRequestException, Injectable } from '@nestjs/common';
import { HomeRepository } from './home.repository';

@Injectable()
export class HomeService {
  constructor(private readonly homeRepository: HomeRepository) {}

  async getHomeData(userId: number) {
    try {
      const data = await this.homeRepository.fetchHomeData(userId);
      return data;
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }
}
