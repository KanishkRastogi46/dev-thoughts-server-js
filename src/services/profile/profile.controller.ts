import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Request, Response } from 'express';
import { RolesDecorator } from 'src/common/decorator/roles.decorators';
import { RoleNames } from 'src/common/enum/role.enum';
import { RoleGuard } from 'src/common/guard/role.guard';

@Controller({ path: 'profile', version: '1' })
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('')
  @RolesDecorator([RoleNames.USER, RoleNames.ADMIN, RoleNames.SUPER_ADMIN])
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: Request, @Res() res: Response) {
    const userId = Number(req.headers['x-user-id']);
    const profile = await this.profileService.getProfile(userId);
    return res.status(HttpStatus.OK).json(profile);
  }

  @Get('country-list')
  @HttpCode(HttpStatus.OK)
  async getCountryList(@Res() res: Response) {
    const countries = await this.profileService.getCountryList();
    return res.status(HttpStatus.OK).json(countries);
  }
}
