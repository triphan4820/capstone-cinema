import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../shared/database/prisma.service';
import { JwtTokenService } from '../../shared/jwt/jwt-token.service';
import {
  CapNhatNguoiDungDto,
  DangKyDto,
  DangNhapDto,
  ThemNguoiDungDto,
} from './dto/nguoi-dung.dto';

@Injectable()
export class QuanLyNguoiDungService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async dangNhap(dto: DangNhapDto) {
    const user = await this.prisma.users.findFirst({
      where: {
        OR: [
          { userEmail: dto.taiKhoan },
          { userId: !isNaN(Number(dto.taiKhoan)) ? Number(dto.taiKhoan) : -1 },
        ],
        isDeleted: false,
      },
    });

    if (!user || !user.userPassword) {
      throw new BadRequestException('Tài khoản hoặc mật khẩu không đúng!');
    }

    const isMatch = await bcrypt.compare(dto.matKhau, user.userPassword);
    if (!isMatch) {
      throw new BadRequestException('Tài khoản hoặc mật khẩu không đúng!');
    }

    const tokens = this.jwtTokenService.generateTokens(
      user.userId,
      user.userType || 'user',
    );

    return {
      taiKhoan: user.userEmail,
      hoTen: user.userFullname || '',
      email: user.userEmail,
      soDT: user.userPhone || '',
      maNhom: 'GP01',
      maLoaiNguoiDung: user.userType === 'admin' ? 'QuanTri' : 'KhachHang',
      accessToken: tokens.accessToken,
    };
  }

  async dangKy(dto: DangKyDto) {
    const existing = await this.prisma.users.findUnique({
      where: { userEmail: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email đã tồn tại!');
    }

    const hashedPassword = await bcrypt.hash(dto.matKhau, 10);
    const created = await this.prisma.users.create({
      data: {
        userEmail: dto.email,
        userPassword: hashedPassword,
        userFullname: dto.hoTen,
        userPhone: dto.soDt,
        userType: 'user',
      },
    });

    return {
      taiKhoan: created.userEmail,
      matKhau: dto.matKhau,
      email: created.userEmail,
      soDT: created.userPhone || '',
      maNhom: dto.maNhom || 'GP01',
      maLoaiNguoiDung: 'KhachHang',
      hoTen: created.userFullname || '',
    };
  }

  layDanhSachLoaiNguoiDung() {
    return [
      { maLoaiNguoiDung: 'KhachHang', tenLoai: 'Khách hàng' },
      { maLoaiNguoiDung: 'QuanTri', tenLoai: 'Quản trị' },
    ];
  }

  async layDanhSachNguoiDung(tuKhoa?: string) {
    const users = await this.prisma.users.findMany({
      where: {
        isDeleted: false,
        ...(tuKhoa
          ? {
              OR: [
                { userFullname: { contains: tuKhoa } },
                { userEmail: { contains: tuKhoa } },
              ],
            }
          : {}),
      },
      select: {
        userId: true,
        userFullname: true,
        userEmail: true,
        userPhone: true,
        userType: true,
      },
    });

    return users.map((u) => ({
      taiKhoan: u.userEmail,
      hoTen: u.userFullname || '',
      email: u.userEmail,
      soDt: u.userPhone || '',
      matKhau: '',
      maLoaiNguoiDung: u.userType === 'admin' ? 'QuanTri' : 'KhachHang',
    }));
  }

  async layDanhSachNguoiDungPhanTrang(
    soTrang = 1,
    soPhanTuTrenTrang = 20,
    tuKhoa?: string,
  ) {
    const page = Math.max(1, Number(soTrang) || 1);
    const pageSize = Math.max(1, Number(soPhanTuTrenTrang) || 20);
    const skip = (page - 1) * pageSize;

    const whereClause = {
      isDeleted: false,
      ...(tuKhoa
        ? {
            OR: [
              { userFullname: { contains: tuKhoa } },
              { userEmail: { contains: tuKhoa } },
            ],
          }
        : {}),
    };

    const [items, totalCount] = await Promise.all([
      this.prisma.users.findMany({
        where: whereClause,
        skip,
        take: pageSize,
      }),
      this.prisma.users.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      currentPage: page,
      count: items.length,
      totalPages,
      totalCount,
      items: items.map((u) => ({
        taiKhoan: u.userEmail,
        hoTen: u.userFullname || '',
        email: u.userEmail,
        soDt: u.userPhone || '',
        matKhau: '',
        maLoaiNguoiDung: u.userType === 'admin' ? 'QuanTri' : 'KhachHang',
      })),
    };
  }

  async thongTinTaiKhoan(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại!');
    }

    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        BookingDetail: {
          include: {
            Showtime: {
              include: {
                Movies: true,
              },
            },
            Seats: true,
          },
        },
      },
    });

    const thongTinDatVe = bookings.flatMap((b) =>
      b.BookingDetail.map((detail) => ({
        maVe: detail.detailId,
        ngayDat: b.createAt,
        tenPhim: detail.Showtime?.Movies?.movieName || '',
        hinhAnh: detail.Showtime?.Movies?.movieImage || '',
        giaVe: detail.Showtime?.bookingPrice || 0,
        thoiLuongPhim: 120,
        danhSachGhe: [
          {
            maHeThongRap: 'BHDStar',
            tenHeThongRap: 'BHD Star Cineplex',
            maCumRap: 'bhd-star-cineplex-3-2',
            tenCumRap: 'BHD Star Cineplex - 3/2',
            maRap: detail.Showtime?.screenId || 1,
            tenRap: `Rạp ${detail.Showtime?.screenId || 1}`,
            maGhe: detail.seatId,
            tenGhe: detail.Seats?.seatName || '',
          },
        ],
      })),
    );

    return {
      taiKhoan: user.userEmail,
      matKhau: '',
      hoTen: user.userFullname || '',
      email: user.userEmail,
      soDT: user.userPhone || '',
      maNhom: 'GP01',
      maLoaiNguoiDung: user.userType === 'admin' ? 'QuanTri' : 'KhachHang',
      thongTinDatVe,
    };
  }

  async layThongTinNguoiDung(taiKhoan?: string, currentUserId?: number) {
    let targetUserId = currentUserId;
    if (taiKhoan) {
      const user = await this.prisma.users.findFirst({
        where: {
          OR: [
            { userEmail: taiKhoan },
            { userId: !isNaN(Number(taiKhoan)) ? Number(taiKhoan) : -1 },
          ],
          isDeleted: false,
        },
      });
      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại!');
      }
      targetUserId = user.userId;
    }

    if (!targetUserId) {
      throw new BadRequestException('Tài khoản là bắt buộc!');
    }

    return this.thongTinTaiKhoan(targetUserId);
  }

  async themNguoiDung(dto: ThemNguoiDungDto) {
    const existing = await this.prisma.users.findUnique({
      where: { userEmail: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Tài khoản/Email đã tồn tại!');
    }

    const hashedPassword = await bcrypt.hash(dto.matKhau, 10);
    await this.prisma.users.create({
      data: {
        userEmail: dto.email,
        userPassword: hashedPassword,
        userFullname: dto.hoTen,
        userPhone: dto.soDt,
        userType: dto.maLoaiNguoiDung === 'QuanTri' ? 'admin' : 'user',
      },
    });

    return 'Thêm người dùng thành công!';
  }

  async capNhatThongTinNguoiDung(dto: CapNhatNguoiDungDto) {
    const user = await this.prisma.users.findFirst({
      where: {
        OR: [{ userEmail: dto.taiKhoan }, { userEmail: dto.email }],
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại!');
    }

    const hashedPassword = dto.matKhau
      ? await bcrypt.hash(dto.matKhau, 10)
      : undefined;

    await this.prisma.users.update({
      where: { userId: user.userId },
      data: {
        userFullname: dto.hoTen,
        userPhone: dto.soDt,
        userPassword: hashedPassword,
        userType: dto.maLoaiNguoiDung === 'QuanTri' ? 'admin' : undefined,
      },
    });

    return 'Cập nhật thông tin thành công!';
  }

  async xoaNguoiDung(taiKhoan: string) {
    const user = await this.prisma.users.findFirst({
      where: { userEmail: taiKhoan, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tìm thấy!');
    }

    await this.prisma.users.update({
      where: { userId: user.userId },
      data: { isDeleted: true },
    });

    return 'Xóa người dùng thành công!';
  }
}
