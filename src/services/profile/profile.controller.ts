import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Response } from 'express';

@Controller({ path: 'profile', version: '1' })
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('country-list')
  @HttpCode(HttpStatus.OK)
  async getCountryList(@Res() res: Response) {
    const countries = await this.profileService.getCountryList();
    return res.json(countries);
  }
}
