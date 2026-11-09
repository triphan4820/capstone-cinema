import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { StorageService } from '../../shared/storage/storage.service';
import { ThemPhimDto } from './dto/phim.dto';

export interface FormattedMovie {
  maPhim: number;
  tenPhim: string;
  biDanh: string;
  trailer: string;
  hinhAnh: string;
  moTa: string;
  maNhom: string;
  ngayKhoiChieu: Date | null;
  danhGia: number;
  hot: boolean;
  dangChieu: boolean;
  sapChieu: boolean;
}

export interface PaginatedMovieResult {
  currentPage: number;
  count: number;
  totalPages: number;
  totalCount: number;
  items: FormattedMovie[];
}

function parseCustomDate(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const d = new Date(year, month - 1, day);
    return isNaN(d.getTime()) ? undefined : d;
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? undefined : d;
}

@Injectable()
export class QuanLyPhimService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async layDanhSachBanner() {
    const banners = await this.prisma.banners.findMany({
      where: { isDeleted: false },
    });

    return banners.map((b) => ({
      maBanner: b.bannerId,
      maPhim: b.movieId,
      hinhAnh: b.bannerImage,
    }));
  }

  async layDanhSachPhim(tenPhim?: string): Promise<FormattedMovie[]> {
    const movies = await this.prisma.movies.findMany({
      where: {
        isDeleted: false,
        ...(tenPhim ? { movieName: { contains: tenPhim } } : {}),
      },
      orderBy: { movieId: 'desc' },
    });

    return movies.map((m) => this.formatMovie(m));
  }

  async layDanhSachPhimPhanTrang(
    soTrang = 1,
    soPhanTuTrenTrang = 10,
    tenPhim?: string,
  ): Promise<PaginatedMovieResult> {
    const page = Math.max(1, Number(soTrang) || 1);
    const pageSize = Math.max(1, Number(soPhanTuTrenTrang) || 10);
    const skip = (page - 1) * pageSize;

    const whereClause = {
      isDeleted: false,
      ...(tenPhim ? { movieName: { contains: tenPhim } } : {}),
    };

    const [items, totalCount] = await Promise.all([
      this.prisma.movies.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { movieId: 'desc' },
      }),
      this.prisma.movies.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      currentPage: page,
      count: items.length,
      totalPages,
      totalCount,
      items: items.map((m) => this.formatMovie(m)),
    };
  }

  async layDanhSachPhimTheoNgay(
    tuNgay?: string,
    denNgay?: string,
    soTrang = 1,
    soPhanTuTrenTrang = 10,
    tenPhim?: string,
  ): Promise<PaginatedMovieResult> {
    const page = Math.max(1, Number(soTrang) || 1);
    const pageSize = Math.max(1, Number(soPhanTuTrenTrang) || 10);
    const skip = (page - 1) * pageSize;

    const fromDate = parseCustomDate(tuNgay);
    const toDate = parseCustomDate(denNgay);

    const whereClause = {
      isDeleted: false,
      ...(tenPhim ? { movieName: { contains: tenPhim } } : {}),
      ...(fromDate || toDate
        ? {
            dateRelease: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    };

    const [items, totalCount] = await Promise.all([
      this.prisma.movies.findMany({
        where: whereClause,
        skip,
        take: pageSize,
      }),
      this.prisma.movies.count({ where: whereClause }),
    ]);

    return {
      currentPage: page,
      count: items.length,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      items: items.map((m) => this.formatMovie(m)),
    };
  }

  async layThongTinPhim(maPhim: number) {
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
      throw new NotFoundException('Không tìm thấy phim!');
    }

    const heThongRapChieu = movie.Showtime.map((st) => ({
      maHeThongRap: st.Screens?.Cinemas?.Brands?.brandName || 'BHDStar',
      tenHeThongRap: st.Screens?.Cinemas?.Brands?.brandName || 'BHD Star',
      logo: st.Screens?.Cinemas?.Brands?.brandLogo || '',
      cumRapChieu: [
        {
          maCumRap: `cum-rap-${st.Screens?.cinemaId || 1}`,
          tenCumRap: st.Screens?.Cinemas?.cinemaName || 'Rạp Chiếu',
          diaChi: st.Screens?.Cinemas?.cinemaAddress || '',
          lichChieuPhim: [
            {
              maLichChieu: st.showId,
              maRap: st.screenId,
              tenRap: st.Screens?.screenName || `Rạp ${st.screenId}`,
              ngayChieuGioChieu: st.showTime,
              giaVe: st.bookingPrice,
              thoiLuong: 120,
            },
          ],
        },
      ],
    }));

    return {
      ...this.formatMovie(movie),
      heThongRapChieu,
    };
  }

  async themPhim(
    dto: ThemPhimDto,
    file?: Express.Multer.File,
  ): Promise<FormattedMovie> {
    let imageUrl = '';
    if (file) {
      const upload = await this.storageService.uploadFile(file);
      imageUrl = upload.secure_url || upload.url;
    }

    const created = await this.prisma.movies.create({
      data: {
        movieName: dto.tenPhim,
        movieTrailer: dto.trailer || '',
        movieDescription: dto.moTa || '',
        movieImage: imageUrl,
        dateRelease: dto.ngayKhoiChieu
          ? new Date(dto.ngayKhoiChieu)
          : new Date(),
        movieRating: dto.danhGia ? Number(dto.danhGia) : 10,
        isTrending: dto.hot === true || dto.hot === 'true',
        isShowing: dto.dangChieu === true || dto.dangChieu === 'true',
        isUpcoming: dto.sapChieu === true || dto.sapChieu === 'true',
      },
    });

    return this.formatMovie(created);
  }

  async capNhatPhimUpload(
    dto: ThemPhimDto,
    file?: Express.Multer.File,
  ): Promise<FormattedMovie> {
    const maPhim = dto.maPhim ? Number(dto.maPhim) : undefined;
    if (!maPhim) {
      throw new BadRequestException('Mã phim là bắt buộc khi cập nhật!');
    }

    const movie = await this.prisma.movies.findUnique({
      where: { movieId: maPhim, isDeleted: false },
    });

    if (!movie) {
      throw new NotFoundException('Phim không tồn tại!');
    }

    let imageUrl = movie.movieImage;
    if (file) {
      const upload = await this.storageService.uploadFile(file);
      imageUrl = upload.secure_url || upload.url;
    }

    const updated = await this.prisma.movies.update({
      where: { movieId: maPhim },
      data: {
        movieName: dto.tenPhim || movie.movieName,
        movieTrailer:
          dto.trailer !== undefined ? dto.trailer : movie.movieTrailer,
        movieDescription:
          dto.moTa !== undefined ? dto.moTa : movie.movieDescription,
        movieImage: imageUrl,
        dateRelease: dto.ngayKhoiChieu
          ? new Date(dto.ngayKhoiChieu)
          : movie.dateRelease,
        movieRating: dto.danhGia ? Number(dto.danhGia) : movie.movieRating,
        isTrending:
          dto.hot !== undefined
            ? dto.hot === true || dto.hot === 'true'
            : movie.isTrending,
        isShowing:
          dto.dangChieu !== undefined
            ? dto.dangChieu === true || dto.dangChieu === 'true'
            : movie.isShowing,
        isUpcoming:
          dto.sapChieu !== undefined
            ? dto.sapChieu === true || dto.sapChieu === 'true'
            : movie.isUpcoming,
      },
    });

    return this.formatMovie(updated);
  }

  async uploadHinhAnh(
    file: Express.Multer.File,
    tenPhim?: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('File hình ảnh là bắt buộc!');
    }
    const upload = await this.storageService.uploadFile(file);
    const imageUrl = upload.secure_url || upload.url;

    if (tenPhim) {
      const movie = await this.prisma.movies.findFirst({
        where: { movieName: tenPhim, isDeleted: false },
      });
      if (movie) {
        await this.prisma.movies.update({
          where: { movieId: movie.movieId },
          data: { movieImage: imageUrl },
        });
      }
    }

    return imageUrl;
  }

  async xoaPhim(maPhim: number): Promise<string> {
    const movie = await this.prisma.movies.findUnique({
      where: { movieId: maPhim, isDeleted: false },
    });

    if (!movie) {
      throw new NotFoundException('Phim không tồn tại!');
    }

    await this.prisma.movies.update({
      where: { movieId: maPhim },
      data: { isDeleted: true },
    });

    return 'Xóa phim thành công!';
  }

  private formatMovie(m: {
    movieId: number;
    movieName: string;
    movieTrailer: string | null;
    movieImage: string | null;
    movieDescription: string | null;
    dateRelease: Date | null;
    movieRating: number | null;
    isTrending: boolean | null;
    isShowing: boolean | null;
    isUpcoming: boolean | null;
  }): FormattedMovie {
    return {
      maPhim: m.movieId,
      tenPhim: m.movieName,
      biDanh: m.movieName.toLowerCase().replace(/\s+/g, '-'),
      trailer: m.movieTrailer || '',
      hinhAnh: m.movieImage || '',
      moTa: m.movieDescription || '',
      maNhom: 'GP01',
      ngayKhoiChieu: m.dateRelease,
      danhGia: m.movieRating || 10,
      hot: !!m.isTrending,
      dangChieu: m.isShowing !== false,
      sapChieu: !!m.isUpcoming,
    };
  }
}
