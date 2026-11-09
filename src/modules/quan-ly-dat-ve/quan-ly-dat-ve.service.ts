import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { DanhSachVeDatDto, TaoLichChieuDto } from './dto/dat-ve.dto';

@Injectable()
export class QuanLyDatVeService {
  constructor(private readonly prisma: PrismaService) {}

  async layDanhSachPhongVe(maLichChieu: number) {
    if (!maLichChieu) {
      throw new BadRequestException('MaLichChieu là bắt buộc!');
    }

    const showtime = await this.prisma.showtime.findUnique({
      where: { showId: maLichChieu, isDeleted: false },
      include: {
        Movies: true,
        BookingDetail: true,
        Screens: {
          include: {
            Cinemas: true,
            Seats: {
              where: { isDeleted: false },
              orderBy: { seatId: 'asc' },
            },
          },
        },
      },
    });

    if (!showtime) {
      throw new NotFoundException('Lịch chiếu không tồn tại!');
    }

    const bookedSeatIds = new Set(showtime.BookingDetail.map((d) => d.seatId));
    const showDate = new Date(showtime.showTime);
    const ngayChieu = showDate.toISOString().split('T')[0];
    const gioChieu = showDate.toTimeString().substring(0, 5);

    const danhSachGhe = (showtime.Screens?.Seats || []).map((seat, index) => {
      const daDat = bookedSeatIds.has(seat.seatId);
      return {
        maGhe: seat.seatId,
        tenGhe: seat.seatName,
        maRap: seat.screenId,
        loaiGhe: seat.seatType || 'Thuong',
        stt: String(index + 1).padStart(2, '0'),
        giaVe: showtime.bookingPrice,
        daDat,
        taiKhoanNguoiDat: daDat ? 'user@gmail.com' : null,
      };
    });

    return {
      thongTinPhim: {
        maLichChieu: showtime.showId,
        tenCumRap: showtime.Screens?.Cinemas?.cinemaName || 'Cụm Rạp',
        tenRap: showtime.Screens?.screenName || `Rạp ${showtime.screenId}`,
        diaChi: showtime.Screens?.Cinemas?.cinemaAddress || '',
        tenPhim: showtime.Movies?.movieName || '',
        hinhAnh: showtime.Movies?.movieImage || '',
        ngayChieu,
        gioChieu,
      },
      danhSachGhe,
    };
  }

  async datVe(userId: number, dto: DanhSachVeDatDto) {
    const seatIds = dto.danhSachVe.map((v) => v.maGhe);

    await this.prisma.$transaction(async (tx) => {
      const booked = await tx.bookingDetail.findMany({
        where: {
          showId: dto.maLichChieu,
          seatId: { in: seatIds },
        },
      });

      if (booked.length > 0) {
        throw new BadRequestException('Ghế đã được đặt trước bởi người khác!');
      }

      await tx.booking.create({
        data: {
          userId,
          BookingDetail: {
            create: seatIds.map((seatId) => ({
              showId: dto.maLichChieu,
              seatId,
            })),
          },
        },
      });
    });

    return 'Đặt vé thành công!';
  }

  async taoLichChieu(dto: TaoLichChieuDto) {
    const movie = await this.prisma.movies.findUnique({
      where: { movieId: dto.maPhim, isDeleted: false },
    });

    if (!movie) {
      throw new NotFoundException('Phim không tồn tại!');
    }

    const screenId = Number(dto.maRap);
    const screen = await this.prisma.screens.findUnique({
      where: { screenId, isDeleted: false },
    });

    if (!screen) {
      throw new NotFoundException('Rạp không tồn tại!');
    }

    await this.prisma.showtime.create({
      data: {
        movieId: dto.maPhim,
        screenId,
        showTime: new Date(dto.ngayChieuGioChieu),
        bookingPrice: Number(dto.giaVe),
      },
    });

    return 'Tạo lịch chiếu thành công!';
  }
}
