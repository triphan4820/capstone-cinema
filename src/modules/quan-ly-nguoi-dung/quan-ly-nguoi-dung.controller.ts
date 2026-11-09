import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import {
  CapNhatNguoiDungDto,
  DangKyDto,
  DangNhapDto,
  ThemNguoiDungDto,
} from './dto/nguoi-dung.dto';
import { QuanLyNguoiDungService } from './quan-ly-nguoi-dung.service';

@ApiTags('QuanLyNguoiDung')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('QuanLyNguoiDung')
export class QuanLyNguoiDungController {
  constructor(private readonly nguoiDungService: QuanLyNguoiDungService) {}

  @Public()
  @Post('DangNhap')
  @ApiOperation({ summary: 'Đăng nhập hệ thống' })
  dangNhap(@Body() dto: DangNhapDto) {
    return this.nguoiDungService.dangNhap(dto);
  }

  @Public()
  @Post('DangKy')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  dangKy(@Body() dto: DangKyDto) {
    return this.nguoiDungService.dangKy(dto);
  }

  @Public()
  @Get('LayDanhSachLoaiNguoiDung')
  @ApiOperation({ summary: 'Lấy danh sách loại người dùng' })
  layDanhSachLoaiNguoiDung() {
    return this.nguoiDungService.layDanhSachLoaiNguoiDung();
  }

  @Public()
  @Get(['LayDanhSachNguoiDung', 'TimKiemNguoiDung'])
  @ApiOperation({ summary: 'Lấy danh sách người dùng hoặc tìm kiếm' })
  @ApiQuery({ name: 'MaNhom', required: false, type: String })
  @ApiQuery({ name: 'tuKhoa', required: false, type: String })
  layDanhSachNguoiDung(@Query('tuKhoa') tuKhoa?: string) {
    return this.nguoiDungService.layDanhSachNguoiDung(tuKhoa);
  }

  @Public()
  @Get(['LayDanhSachNguoiDungPhanTrang', 'TimKiemNguoiDungPhanTrang'])
  @ApiOperation({ summary: 'Lấy danh sách người dùng phân trang' })
  @ApiQuery({ name: 'MaNhom', required: false, type: String })
  @ApiQuery({ name: 'tuKhoa', required: false, type: String })
  @ApiQuery({ name: 'soTrang', required: false, type: Number })
  @ApiQuery({ name: 'soPhanTuTrenTrang', required: false, type: Number })
  layDanhSachNguoiDungPhanTrang(
    @Query('soTrang') soTrang?: string,
    @Query('soPhanTuTrenTrang') soPhanTuTrenTrang?: string,
    @Query('tuKhoa') tuKhoa?: string,
  ) {
    return this.nguoiDungService.layDanhSachNguoiDungPhanTrang(
      soTrang ? Number(soTrang) : 1,
      soPhanTuTrenTrang ? Number(soPhanTuTrenTrang) : 20,
      tuKhoa,
    );
  }

  @ApiBearerAuth()
  @Post('ThongTinTaiKhoan')
  @ApiOperation({ summary: 'Lấy thông tin tài khoản và lịch sử đặt vé' })
  thongTinTaiKhoan(@CurrentUser('userId') userId: number) {
    return this.nguoiDungService.thongTinTaiKhoan(userId);
  }

  @ApiBearerAuth()
  @Post('LayThongTinNguoiDung')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo tài khoản' })
  @ApiQuery({ name: 'taiKhoan', required: false, type: String })
  layThongTinNguoiDung(
    @CurrentUser('userId') currentUserId: number,
    @Query('taiKhoan') taiKhoan?: string,
  ) {
    return this.nguoiDungService.layThongTinNguoiDung(taiKhoan, currentUserId);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Post('ThemNguoiDung')
  @ApiOperation({ summary: 'Thêm người dùng mới' })
  themNguoiDung(@Body() dto: ThemNguoiDungDto) {
    return this.nguoiDungService.themNguoiDung(dto);
  }

  @ApiBearerAuth()
  @Put('CapNhatThongTinNguoiDung')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  capNhatThongTinNguoiDung(@Body() dto: CapNhatNguoiDungDto) {
    return this.nguoiDungService.capNhatThongTinNguoiDung(dto);
  }

  @ApiBearerAuth()
  @Post('CapNhatThongTinNguoiDung')
  @ApiOperation({ summary: 'Cập nhật thông tin (POST alias)' })
  capNhat(@Body() dto: CapNhatNguoiDungDto) {
    return this.nguoiDungService.capNhatThongTinNguoiDung(dto);
  }

  @ApiBearerAuth()
  @Roles('admin')
  @Delete('XoaNguoiDung')
  @ApiOperation({ summary: 'Xóa người dùng theo tài khoản' })
  @ApiQuery({ name: 'TaiKhoan', required: true, type: String })
  xoaNguoiDung(@Query('TaiKhoan') taiKhoan: string) {
    return this.nguoiDungService.xoaNguoiDung(taiKhoan);
  }
}
