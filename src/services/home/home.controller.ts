import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { RoleGuard } from 'src/common/guard/role.guard';
import { RolesDecorator } from 'src/common/decorator/roles.decorators';
import { RoleNames } from 'src/common/enum/role.enum';
import { Request, Response } from 'express';

@Controller({ path: 'home', version: '1' })
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @RolesDecorator([RoleNames.USER])
  @UseGuards(RoleGuard)
  async getHomeData(@Req() req: Request, @Res() res: Response) {
    const userId = Number(req.headers['x-user-id']);
    const data = await this.homeService.getHomeData(userId);
    return res.status(HttpStatus.OK).json(data);
  }
}
