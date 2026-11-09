import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/decorators/public.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { QuanLyRapService } from './quan-ly-rap.service';

@ApiTags('QuanLyRap')
@UseGuards(JwtAuthGuard)
@Controller('QuanLyRap')
export class QuanLyRapController {
  constructor(private readonly rapService: QuanLyRapService) {}

  @Public()
  @Get('LayThongTinHeThongRap')
  @ApiOperation({ summary: 'Lấy thông tin hệ thống rạp' })
  @ApiQuery({ name: 'maHeThongRap', required: false, type: String })
  layThongTinHeThongRap(@Query('maHeThongRap') maHeThongRap?: string) {
    return this.rapService.layThongTinHeThongRap(maHeThongRap);
  }

  @Public()
  @Get('LayThongTinCumRapTheoHeThong')
  @ApiOperation({ summary: 'Lấy thông tin cụm rạp theo hệ thống' })
  @ApiQuery({ name: 'maHeThongRap', required: true, type: String })
  layThongTinCumRapTheoHeThong(@Query('maHeThongRap') maHeThongRap: string) {
    return this.rapService.layThongTinCumRapTheoHeThong(maHeThongRap);
  }

  @Public()
  @Get('LayThongTinLichChieuHeThongRap')
  @ApiOperation({ summary: 'Lấy thông tin lịch chiếu toàn bộ hệ thống rạp' })
  @ApiQuery({ name: 'maHeThongRap', required: false, type: String })
  @ApiQuery({ name: 'maNhom', required: false, type: String })
  layThongTinLichChieuHeThongRap(
    @Query('maHeThongRap') maHeThongRap?: string,
  ): Promise<unknown> {
    return this.rapService.layThongTinLichChieuHeThongRap(maHeThongRap);
  }

  @Public()
  @Get('LayThongTinLichChieuPhim')
  @ApiOperation({ summary: 'Lấy thông tin lịch chiếu theo phim' })
  @ApiQuery({ name: 'MaPhim', required: true, type: Number })
  layThongTinLichChieuPhim(@Query('MaPhim') maPhim: string): Promise<unknown> {
    return this.rapService.layThongTinLichChieuPhim(Number(maPhim));
  }
}
