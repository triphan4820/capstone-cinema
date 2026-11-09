import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

export interface LichChieuTheoPhim {
  maLichChieu: number;
  maRap: number;
  tenRap: string;
  ngayChieuGioChieu: Date;
  giaVe: number;
  thoiLuong?: number;
}

export interface PhimTrongCumRap {
  maPhim: number;
  tenPhim: string;
  hinhAnh: string;
  hot: boolean;
  dangChieu: boolean;
  sapChieu: boolean;
  lstLichChieuTheoPhim: LichChieuTheoPhim[];
}

export interface CumRapChieu {
  maCumRap: string;
  tenCumRap: string;
  diaChi: string;
  lichChieuPhim: LichChieuTheoPhim[];
}

export interface HeThongRapChieuGroup {
  maHeThongRap: string;
  tenHeThongRap: string;
  logo: string;
  cumRapChieu: Map<number, CumRapChieu>;
}

@Injectable()
export class QuanLyRapService {
  constructor(private readonly prisma: PrismaService) {}

  async layThongTinHeThongRap(maHeThongRap?: string) {
    const brands = await this.prisma.brands.findMany({
      where: {
        isDeleted: false,
        ...(maHeThongRap ? { brandName: { contains: maHeThongRap } } : {}),
      },
    });

    return brands.map((b) => ({
      maHeThongRap: b.brandName,
      tenHeThongRap: b.brandName,
      biDanh: b.brandName.toLowerCase().replace(/\s+/g, '-'),
      logo: b.brandLogo || '',
      aliases: [b.brandName],
    }));
  }

  async layThongTinCumRapTheoHeThong(maHeThongRap: string) {
    if (!maHeThongRap) {
      throw new BadRequestException('maHeThongRap là bắt buộc!');
    }

    const cinemas = await this.prisma.cinemas.findMany({
      where: {
        isDeleted: false,
        Brands: {
          brandName: { contains: maHeThongRap },
        },
      },
      include: {
        Screens: {
          where: { isDeleted: false },
        },
      },
    });

    return cinemas.map((c) => ({
      maCumRap: `cum-rap-${c.cinemaId}`,
      tenCumRap: c.cinemaName,
      diaChi: c.cinemaAddress || '',
      danhSachRap: c.Screens.map((s) => ({
        maRap: s.screenId,
        tenRap: s.screenName || `Rạp ${s.screenId}`,
      })),
    }));
  }

  async layThongTinLichChieuHeThongRap(maHeThongRap?: string) {
    const brands = await this.prisma.brands.findMany({
      where: {
        isDeleted: false,
        ...(maHeThongRap ? { brandName: { contains: maHeThongRap } } : {}),
      },
      include: {
        Cinemas: {
          where: { isDeleted: false },
          include: {
            Screens: {
              where: { isDeleted: false },
              include: {
                Showtime: {
                  where: { isDeleted: false },
                  include: {
                    Movies: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return brands.map((brand) => ({
      maHeThongRap: brand.brandName,
      tenHeThongRap: brand.brandName,
      logo: brand.brandLogo || '',
      mahom: 'GP01',
      lstCumRap: brand.Cinemas.map((cinema) => {
        const movieMap = new Map<number, PhimTrongCumRap>();

        for (const screen of cinema.Screens) {
          for (const show of screen.Showtime) {
            if (!show.Movies) continue;
            const movieId = show.movieId;
            if (!movieMap.has(movieId)) {
              movieMap.set(movieId, {
                maPhim: movieId,
                tenPhim: show.Movies.movieName,
                hinhAnh: show.Movies.movieImage || '',
                hot: !!show.Movies.isTrending,
                dangChieu: show.Movies.isShowing !== false,
                sapChieu: !!show.Movies.isUpcoming,
                lstLichChieuTheoPhim: [],
              });
            }

            const movieEntry = movieMap.get(movieId);
            if (movieEntry) {
              movieEntry.lstLichChieuTheoPhim.push({
                maLichChieu: show.showId,
                maRap: screen.screenId,
                tenRap: screen.screenName || `Rạp ${screen.screenId}`,
                ngayChieuGioChieu: show.showTime,
                giaVe: show.bookingPrice,
              });
            }
          }
        }

        return {
          maCumRap: `cum-rap-${cinema.cinemaId}`,
          tenCumRap: cinema.cinemaName,
          diaChi: cinema.cinemaAddress || '',
          danhSachPhim: Array.from(movieMap.values()),
        };
      }),
    }));
  }

  async layThongTinLichChieuPhim(maPhim: number) {
    if (!maPhim) {
      throw new BadRequestException('MaPhim là bắt buộc!');
    }

    const movie = await this.prisma.movies.findUnique({
      where: { movieId: maPhim, isDeleted: false },
      include: {
        Showtime: {
          where: { isDeleted: false },
          include: {
            Screens: {
              include: {
                Cinemas: {
                  include: {
                    Brands: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!movie) {
      throw new NotFoundException('Phim không tồn tại!');
    }

    const brandMap = new Map<string, HeThongRapChieuGroup>();

    for (const show of movie.Showtime) {
      const brandName = show.Screens?.Cinemas?.Brands?.brandName || 'BHDStar';
      const brandLogo = show.Screens?.Cinemas?.Brands?.brandLogo || '';
      const cinemaId = show.Screens?.cinemaId || 1;
      const cinemaName = show.Screens?.Cinemas?.cinemaName || 'Rạp';
      const cinemaAddress = show.Screens?.Cinemas?.cinemaAddress || '';

      if (!brandMap.has(brandName)) {
        brandMap.set(brandName, {
          maHeThongRap: brandName,
          tenHeThongRap: brandName,
          logo: brandLogo,
          cumRapChieu: new Map<number, CumRapChieu>(),
        });
      }

      const brandObj = brandMap.get(brandName);
      if (brandObj) {
        if (!brandObj.cumRapChieu.has(cinemaId)) {
          brandObj.cumRapChieu.set(cinemaId, {
            maCumRap: `cum-rap-${cinemaId}`,
            tenCumRap: cinemaName,
            diaChi: cinemaAddress,
            lichChieuPhim: [],
          });
        }

        const cumRapEntry = brandObj.cumRapChieu.get(cinemaId);
        if (cumRapEntry) {
          cumRapEntry.lichChieuPhim.push({
            maLichChieu: show.showId,
            maRap: show.screenId,
            tenRap: show.Screens?.screenName || `Rạp ${show.screenId}`,
            ngayChieuGioChieu: show.showTime,
            giaVe: show.bookingPrice,
            thoiLuong: 120,
          });
        }
      }
    }

    const heThongRapChieu = Array.from(brandMap.values()).map((b) => ({
      maHeThongRap: b.maHeThongRap,
      tenHeThongRap: b.tenHeThongRap,
      logo: b.logo,
      cumRapChieu: Array.from(b.cumRapChieu.values()),
    }));

    return {
      maPhim: movie.movieId,
      tenPhim: movie.movieName,
      biDanh: movie.movieName.toLowerCase().replace(/\s+/g, '-'),
      trailer: movie.movieTrailer || '',
      hinhAnh: movie.movieImage || '',
      moTa: movie.movieDescription || '',
      maNhom: 'GP01',
      hot: !!movie.isTrending,
      dangChieu: movie.isShowing !== false,
      sapChieu: !!movie.isUpcoming,
      ngayKhoiChieu: movie.dateRelease,
      danhGia: movie.movieRating || 10,
      heThongRapChieu,
    };
  }
}
