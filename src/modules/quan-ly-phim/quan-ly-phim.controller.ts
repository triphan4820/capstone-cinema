import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { ThemPhimDto } from './dto/phim.dto';
import {
  FormattedMovie,
  PaginatedMovieResult,
  QuanLyPhimService,
} from './quan-ly-phim.service';

@ApiTags('QuanLyPhim')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('QuanLyPhim')
export class QuanLyPhimController {
  constructor(private readonly phimService: QuanLyPhimService) {}

  @Public()
  @Get('LayDanhSachBanner')
  @ApiOperation({ summary: 'Lấy danh sách banner phim' })
  layDanhSachBanner() {
    return this.phimService.layDanhSachBanner();
  }

  @Public()
  @Get('LayDanhSachPhim')
  @ApiOperation({ summary: 'Lấy danh sách toàn bộ phim' })
  @ApiQuery({ name: 'maNhom', required: false, type: String })
  @ApiQuery({ name: 'tenPhim', required: false, type: String })
  layDanhSachPhim(
    @Query('tenPhim') tenPhim?: string,
  ): Promise<FormattedMovie[]> {
    return this.phimService.layDanhSachPhim(tenPhim);
  }

  @Public()
  @Get('LayDanhSachPhimPhanTrang')
  @ApiOperation({ summary: 'Lấy danh sách phim phân trang' })
  @ApiQuery({ name: 'maNhom', required: false, type: String })
  @ApiQuery({ name: 'tenPhim', required: false, type: String })
  @ApiQuery({ name: 'soTrang', required: false, type: Number })
  @ApiQuery({ name: 'soPhanTuTrenTrang', required: false, type: Number })
  layDanhSachPhimPhanTrang(
    @Query('soTrang') soTrang?: string,
    @Query('soPhanTuTrenTrang') soPhanTuTrenTrang?: string,
    @Query('tenPhim') tenPhim?: string,
  ): Promise<PaginatedMovieResult> {
    return this.phimService.layDanhSachPhimPhanTrang(
      soTrang ? Number(soTrang) : 1,
      soPhanTuTrenTrang ? Number(soPhanTuTrenTrang) : 10,
      tenPhim,
    );
  }

  @Public()
  @Get('LayDanhSachPhimTheoNgay')
  @ApiOperation({ summary: 'Lấy danh sách phim theo khoảng thời gian' })
  @ApiQuery({ name: 'maNhom', required: false, type: String })
  @ApiQuery({ name: 'tenPhim', required: false, type: String })
  @ApiQuery({ name: 'soTrang', required: false, type: Number })
  @ApiQuery({ name: 'soPhanTuTrenTrang', required: false, type: Number })
  @ApiQuery({ name: 'tuNgay', required: false, type: String })
  @ApiQuery({ name: 'denNgay', required: false, type: String })
  layDanhSachPhimTheoNgay(
    @Query('tuNgay') tuNgay?: string,
    @Query('denNgay') denNgay?: string,
    @Query('soTrang') soTrang?: string,
    @Query('soPhanTuTrenTrang') soPhanTuTrenTrang?: string,
    @Query('tenPhim') tenPhim?: string,
  ): Promise<PaginatedMovieResult> {
    return this.phimService.layDanhSachPhimTheoNgay(
      tuNgay,
      denNgay,
      soTrang ? Number(soTrang) : 1,
      soPhanTuTrenTrang ? Number(soPhanTuTrenTrang) : 10,
      tenPhim,
    );
  }

  @Public()
  @Get('LayThongTinPhim')
  @ApiOperation({ summary: 'Lấy chi tiết phim và lịch chiếu' })
  @ApiQuery({ name: 'MaPhim', required: true, type: Number })
  layThongTinPhim(@Query('MaPhim') maPhim: string) {
    return this.phimService.layThongTinPhim(Number(maPhim));
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Post('ThemPhimUploadHinh')
  @UseInterceptors(FileInterceptor('File'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Thêm phim kèm upload hình ảnh' })
  themPhim(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ThemPhimDto,
  ): Promise<FormattedMovie> {
    return this.phimService.themPhim(dto, file);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Post('CapNhatPhimUpload')
  @UseInterceptors(FileInterceptor('File'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật phim kèm upload hình ảnh' })
  capNhatPhim(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ThemPhimDto,
  ): Promise<FormattedMovie> {
    return this.phimService.capNhatPhimUpload(dto, file);
  }

  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload hình ảnh phim' })
  @ApiQuery({ name: 'tenPhim', required: false, type: String })
  @ApiQuery({ name: 'maNhom', required: false, type: String })
  uploadHinhAnh(
    @UploadedFile() file: Express.Multer.File,
    @Query('tenPhim') tenPhim?: string,
  ): Promise<string> {
    return this.phimService.uploadHinhAnh(file, tenPhim);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Delete(['XoaPhim', 'XP'])
  @ApiOperation({ summary: 'Xóa phim theo mã phim' })
  @ApiQuery({ name: 'MaPhim', required: true, type: Number })
  xoaPhim(@Query('MaPhim') maPhim: string) {
    return this.phimService.xoaPhim(Number(maPhim));
  }
}
