import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { DanhSachVeDatDto, TaoLichChieuDto } from './dto/dat-ve.dto';
import { QuanLyDatVeService } from './quan-ly-dat-ve.service';

@ApiTags('QuanLyDatVe')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('QuanLyDatVe')
export class QuanLyDatVeController {
  constructor(private readonly datVeService: QuanLyDatVeService) {}

  @Public()
  @Get('LayDanhSachPhongVe')
  @ApiOperation({ summary: 'Lấy danh sách phòng vé và tình trạng ghế' })
  @ApiQuery({ name: 'MaLichChieu', required: true, type: Number })
  layDanhSachPhongVe(@Query('MaLichChieu') maLichChieu: string) {
    return this.datVeService.layDanhSachPhongVe(Number(maLichChieu));
  }

  @ApiBearerAuth()
  @Post('DatVe')
  @ApiOperation({ summary: 'Đặt vé xem phim' })
  datVe(@CurrentUser('userId') userId: number, @Body() dto: DanhSachVeDatDto) {
    return this.datVeService.datVe(userId, dto);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Post('TaoLichChieu')
  @ApiOperation({ summary: 'Tạo lịch chiếu mới (Quản trị)' })
  taoLichChieu(@Body() dto: TaoLichChieuDto) {
    return this.datVeService.taoLichChieu(dto);
  }
}
