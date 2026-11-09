import { Module } from '@nestjs/common';
import { QuanLyPhimController } from './quan-ly-phim.controller';
import { QuanLyPhimService } from './quan-ly-phim.service';

@Module({
  controllers: [QuanLyPhimController],
  providers: [QuanLyPhimService],
  exports: [QuanLyPhimService],
})
export class QuanLyPhimModule {}
