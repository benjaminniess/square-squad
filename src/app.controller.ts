import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/env')
  getEnvJson(): any {
    return this.appService.getEnvJson();
  }
}
