import { Module } from '@nestjs/common';
import { HelpersModule } from '../helpers/helpers.module';

@Module({
  imports: [HelpersModule],
})
export class RoomsModule {}
