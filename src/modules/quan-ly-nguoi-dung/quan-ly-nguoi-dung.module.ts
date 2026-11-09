import { Module } from '@nestjs/common';
import { QuanLyNguoiDungController } from './quan-ly-nguoi-dung.controller';
import { QuanLyNguoiDungService } from './quan-ly-nguoi-dung.service';

@Module({
  controllers: [QuanLyNguoiDungController],
  providers: [QuanLyNguoiDungService],
  exports: [QuanLyNguoiDungService],
})
export class QuanLyNguoiDungModule {}
