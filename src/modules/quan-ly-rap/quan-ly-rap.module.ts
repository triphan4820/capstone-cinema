import { Module } from '@nestjs/common';
import { QuanLyRapController } from './quan-ly-rap.controller';
import { QuanLyRapService } from './quan-ly-rap.service';

@Module({
  controllers: [QuanLyRapController],
  providers: [QuanLyRapService],
  exports: [QuanLyRapService],
})
export class QuanLyRapModule {}
