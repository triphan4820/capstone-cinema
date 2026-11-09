import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/core/interceptors/transform.interceptor';
import { PrismaService } from '../src/shared/database/prisma.service';
import { StorageService } from '../src/shared/storage/storage.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createInMemoryPrisma } = require('./mock-prisma.helper') as {
  createInMemoryPrisma: () => Record<string, unknown>;
};

interface ApiEnvelope<T = Record<string, unknown>> {
  statusCode: number;
  message: string;
  content: T;
  dateTime: string;
}

function asEnvelope<T = Record<string, unknown>>(
  res: request.Response,
): ApiEnvelope<T> {
  expect(res.body).toHaveProperty('statusCode', res.status);
  expect(res.body).toHaveProperty('message', 'Xử lý thành công!');
  expect(res.body).toHaveProperty('dateTime');
  expect(res.body).toHaveProperty('content');
  return res.body as ApiEnvelope<T>;
}

const SAMPLE_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
);

describe('Cinema Booking Engine API - 26/26 Endpoints Payload & Response Data E2E', () => {
  let app: INestApplication<App>;
  let adminToken = '';
  let customerToken = '';
  let createdMovieId = 0;
  let xpMovieId = 0;

  beforeAll(async () => {
    const mockPrisma = createInMemoryPrisma();
    const mockStorage = {
      uploadFile: jest.fn().mockResolvedValue({
        secure_url:
          'https://res.cloudinary.com/demo/image/upload/v1/cinema/banners/poster.gif',
        url: 'https://res.cloudinary.com/demo/image/upload/v1/cinema/banners/poster.gif',
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(StorageService)
      .useValue(mockStorage)
      .compile();

    app = moduleFixture.createNestApplication({ logger: false });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. QuanLyNguoiDung (13/13 Endpoints)', () => {
    it('[01/26] POST /api/QuanLyNguoiDung/DangNhap - Gửi payload { taiKhoan, matKhau } & nhận JWT + profile', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/QuanLyNguoiDung/DangNhap')
        .send({ taiKhoan: 'admin@email.com', matKhau: 'qweasd' });
      expect(res.status).toBe(201);
      const body = asEnvelope<{
        taiKhoan: string;
        hoTen: string;
        email: string;
        soDT: string;
        maNhom: string;
        maLoaiNguoiDung: string;
        accessToken: string;
      }>(res);
      expect(body.content).toMatchObject({
        taiKhoan: 'admin@email.com',
        hoTen: 'Quản Trị Hệ Thống',
        email: 'admin@email.com',
        maNhom: 'GP01',
        maLoaiNguoiDung: 'QuanTri',
      });
      expect(body.content.accessToken.length).toBeGreaterThan(20);
      adminToken = body.content.accessToken;
    });

    it('[02/26] POST /api/QuanLyNguoiDung/DangKy - Gửi payload đăng ký & nhận thông tin tài khoản mới', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/QuanLyNguoiDung/DangKy')
        .send({
          taiKhoan: 'khach@cinema.com',
          matKhau: 'qweasd',
          email: 'khach@cinema.com',
          soDt: '0901112222',
          maNhom: 'GP01',
          hoTen: 'Khách Hàng Mới',
        });
      expect(res.status).toBe(201);
      const body = asEnvelope<{
        taiKhoan: string;
        email: string;
        soDT: string;
        maLoaiNguoiDung: string;
        hoTen: string;
      }>(res);
      expect(body.content).toMatchObject({
        taiKhoan: 'khach@cinema.com',
        email: 'khach@cinema.com',
        soDT: '0901112222',
        maLoaiNguoiDung: 'KhachHang',
        hoTen: 'Khách Hàng Mới',
      });

      const loginRes = await request(app.getHttpServer())
        .post('/api/QuanLyNguoiDung/DangNhap')
        .send({ taiKhoan: 'khach@cinema.com', matKhau: 'qweasd' });
      customerToken = asEnvelope<{ accessToken: string }>(loginRes).content
        .accessToken;
    });

    it('[03/26] GET /api/QuanLyNguoiDung/LayDanhSachLoaiNguoiDung - Nhận danh mục loại người dùng', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyNguoiDung/LayDanhSachLoaiNguoiDung',
      );
      expect(res.status).toBe(200);
      expect(asEnvelope(res).content).toEqual([
        { maLoaiNguoiDung: 'KhachHang', tenLoai: 'Khách hàng' },
        { maLoaiNguoiDung: 'QuanTri', tenLoai: 'Quản trị' },
      ]);
    });

    it('[04/26] GET /api/QuanLyNguoiDung/LayDanhSachNguoiDung - Nhận danh sách toàn bộ người dùng', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyNguoiDung/LayDanhSachNguoiDung?MaNhom=GP01',
      );
      expect(res.status).toBe(200);
      const body = asEnvelope<Array<{ taiKhoan: string; email: string }>>(res);
      expect(body.content.length).toBeGreaterThanOrEqual(3);
      expect(body.content[0]).toHaveProperty('taiKhoan');
      expect(body.content[0]).toHaveProperty('maLoaiNguoiDung');
    });

    it('[05/26] GET /api/QuanLyNguoiDung/TimKiemNguoiDung - Gửi query { tuKhoa } & nhận kết quả lọc', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyNguoiDung/TimKiemNguoiDung?tuKhoa=admin',
      );
      expect(res.status).toBe(200);
      const body = asEnvelope<Array<{ email: string }>>(res);
      expect(body.content.some((u) => u.email === 'admin@email.com')).toBe(
        true,
      );
    });

    it('[06/26] GET /api/QuanLyNguoiDung/LayDanhSachNguoiDungPhanTrang - Gửi query { soTrang, soPhanTuTrenTrang } & nhận page object', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyNguoiDung/LayDanhSachNguoiDungPhanTrang?soTrang=1&soPhanTuTrenTrang=2',
      );
      expect(res.status).toBe(200);
      const body = asEnvelope<{
        currentPage: number;
        count: number;
        totalPages: number;
        totalCount: number;
        items: unknown[];
      }>(res);
      expect(body.content.currentPage).toBe(1);
      expect(body.content.count).toBe(2);
      expect(body.content.items).toHaveLength(2);
    });

    it('[07/26] GET /api/QuanLyNguoiDung/TimKiemNguoiDungPhanTrang - Gửi query { tuKhoa, soTrang, soPhanTuTrenTrang }', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyNguoiDung/TimKiemNguoiDungPhanTrang?tuKhoa=Dat&soTrang=1&soPhanTuTrenTrang=5',
      );
      expect(res.status).toBe(200);
      const body = asEnvelope<{
        totalCount: number;
        items: Array<{ email: string }>;
      }>(res);
      expect(body.content.totalCount).toBeGreaterThanOrEqual(1);
      expect(body.content.items[0].email).toBe('d@gmail.com');
    });

    it('[08/26] POST /api/QuanLyNguoiDung/ThongTinTaiKhoan - Gửi Bearer Token & nhận thông tin kèm thongTinDatVe', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/QuanLyNguoiDung/ThongTinTaiKhoan')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(201);
      const body = asEnvelope<{
        email: string;
        maLoaiNguoiDung: string;
        thongTinDatVe: unknown[];
      }>(res);
      expect(body.content.email).toBe('admin@email.com');
      expect(Array.isArray(body.content.thongTinDatVe)).toBe(true);
    });

    it('[09/26] POST /api/QuanLyNguoiDung/LayThongTinNguoiDung - Gửi query { taiKhoan } & nhận chi tiết + lịch sử đặt vé', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/QuanLyNguoiDung/LayThongTinNguoiDung?taiKhoan=d@gmail.com')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(201);
      const body = asEnvelope<{
        email: string;
        thongTinDatVe: Array<{
          tenPhim: string;
          giaVe: number;
          danhSachGhe: Array<{ tenGhe: string }>;
        }>;
      }>(res);
      expect(body.content.email).toBe('d@gmail.com');
      expect(body.content.thongTinDatVe[0]).toMatchObject({
        tenPhim: 'Dune: Hành Tinh Cát - Phần Hai',
        giaVe: 110000,
      });
    });

    it('[10/26] POST /api/QuanLyNguoiDung/ThemNguoiDung - Gửi payload Admin tạo người dùng mới', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/QuanLyNguoiDung/ThemNguoiDung')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          taiKhoan: 'staff@cinema.com',
          matKhau: '123456',
          email: 'staff@cinema.com',
          soDt: '0988776655',
          maNhom: 'GP01',
          maLoaiNguoiDung: 'QuanTri',
          hoTen: 'Nhân Viên Quản Trị',
        });
      expect(res.status).toBe(201);
      expect(asEnvelope<string>(res).content).toBe(
        'Thêm người dùng thành công!',
      );
    });

    it('[11/26] PUT /api/QuanLyNguoiDung/CapNhatThongTinNguoiDung - Gửi payload cập nhật hồ sơ (PUT)', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/QuanLyNguoiDung/CapNhatThongTinNguoiDung')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          taiKhoan: 'khach@cinema.com',
          matKhau: 'qweasd',
          email: 'khach@cinema.com',
          soDt: '0909999999',
          maNhom: 'GP01',
          maLoaiNguoiDung: 'KhachHang',
          hoTen: 'Khách Hàng Đã Cập Nhật PUT',
        });
      expect(res.status).toBe(200);
      expect(asEnvelope<string>(res).content).toBe(
        'Cập nhật thông tin thành công!',
      );
    });

    it('[12/26] POST /api/QuanLyNguoiDung/CapNhatThongTinNguoiDung - Gửi payload cập nhật hồ sơ (POST alias)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/QuanLyNguoiDung/CapNhatThongTinNguoiDung')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          taiKhoan: 'khach@cinema.com',
          matKhau: 'qweasd',
          email: 'khach@cinema.com',
          soDt: '0908888888',
          maNhom: 'GP01',
          maLoaiNguoiDung: 'KhachHang',
          hoTen: 'Khách Hàng Đã Cập Nhật POST',
        });
      expect(res.status).toBe(201);
      expect(asEnvelope<string>(res).content).toBe(
        'Cập nhật thông tin thành công!',
      );
    });

    it('[13/26] DELETE /api/QuanLyNguoiDung/XoaNguoiDung - Gửi query { TaiKhoan } xóa người dùng', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/QuanLyNguoiDung/XoaNguoiDung?TaiKhoan=staff%40cinema.com')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(asEnvelope<string>(res).content).toBe(
        'Xóa người dùng thành công!',
      );
    });
  });

  describe('2. QuanLyPhim (10/10 Endpoints)', () => {
    it('[14/26] GET /api/QuanLyPhim/LayDanhSachBanner - Nhận danh sách banner phim', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyPhim/LayDanhSachBanner',
      );
      expect(res.status).toBe(200);
      const body =
        asEnvelope<
          Array<{ maBanner: number; maPhim: number; hinhAnh: string }>
        >(res);
      expect(body.content.length).toBeGreaterThanOrEqual(2);
      expect(body.content[0]).toHaveProperty('maBanner');
      expect(body.content[0]).toHaveProperty('hinhAnh');
    });

    it('[15/26] GET /api/QuanLyPhim/LayDanhSachPhim - Gửi query { tenPhim } & nhận danh sách phim', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyPhim/LayDanhSachPhim?tenPhim=Dune',
      );
      expect(res.status).toBe(200);
      const body = asEnvelope<Array<{ maPhim: number; tenPhim: string }>>(res);
      expect(body.content.length).toBeGreaterThanOrEqual(1);
      expect(body.content[0].tenPhim).toContain('Dune');
    });

    it('[16/26] GET /api/QuanLyPhim/LayDanhSachPhimPhanTrang - Gửi query phân trang & nhận danh sách phim', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyPhim/LayDanhSachPhimPhanTrang?soTrang=1&soPhanTuTrenTrang=2',
      );
      expect(res.status).toBe(200);
      const body = asEnvelope<{
        currentPage: number;
        count: number;
        totalCount: number;
        items: unknown[];
      }>(res);
      expect(body.content.currentPage).toBe(1);
      expect(body.content.count).toBe(2);
      expect(body.content.totalCount).toBeGreaterThanOrEqual(3);
    });

    it('[17/26] GET /api/QuanLyPhim/LayDanhSachPhimTheoNgay - Gửi query { tuNgay, denNgay } lọc ngày khởi chiếu', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyPhim/LayDanhSachPhimTheoNgay?tuNgay=01/01/2026&denNgay=31/12/2026&soTrang=1&soPhanTuTrenTrang=10',
      );
      expect(res.status).toBe(200);
      const body = asEnvelope<{ items: Array<{ maPhim: number }> }>(res);
      expect(body.content.items.length).toBeGreaterThanOrEqual(3);
    });

    it('[18/26] GET /api/QuanLyPhim/LayThongTinPhim - Gửi query { MaPhim } & nhận chi tiết phim + lịch chiếu', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyPhim/LayThongTinPhim?MaPhim=1',
      );
      expect(res.status).toBe(200);
      const body = asEnvelope<{
        maPhim: number;
        tenPhim: string;
        heThongRapChieu: unknown[];
      }>(res);
      expect(body.content.maPhim).toBe(1);
      expect(Array.isArray(body.content.heThongRapChieu)).toBe(true);
    });

    it('[19/26] POST /api/QuanLyPhim/ThemPhimUploadHinh - Gửi Multipart FormData tạo phim kèm file ảnh', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/QuanLyPhim/ThemPhimUploadHinh')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('tenPhim', 'Phim E2E Test')
        .field('trailer', 'https://youtube.com/watch?v=e2e')
        .field('moTa', 'Mô tả phim E2E')
        .field('ngayKhoiChieu', '2026-06-01')
        .field('danhGia', '9')
        .field('hot', 'true')
        .field('dangChieu', 'true')
        .field('sapChieu', 'false')
        .attach('File', SAMPLE_GIF, 'poster.gif');
      expect(res.status).toBe(201);
      const body = asEnvelope<{
        maPhim: number;
        tenPhim: string;
        hinhAnh: string;
      }>(res);
      expect(body.content.tenPhim).toBe('Phim E2E Test');
      expect(body.content.hinhAnh).toContain('cloudinary.com');
      createdMovieId = body.content.maPhim;
    });

    it('[20/26] POST /api/QuanLyPhim/CapNhatPhimUpload - Gửi Multipart FormData cập nhật phim & ảnh', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/QuanLyPhim/CapNhatPhimUpload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('maPhim', String(createdMovieId))
        .field('tenPhim', 'Phim E2E Updated')
        .field('danhGia', '10')
        .attach('File', SAMPLE_GIF, 'updated.gif');
      expect(res.status).toBe(201);
      const body = asEnvelope<{
        maPhim: number;
        tenPhim: string;
        danhGia: number;
      }>(res);
      expect(body.content.maPhim).toBe(createdMovieId);
      expect(body.content.tenPhim).toBe('Phim E2E Updated');
      expect(body.content.danhGia).toBe(10);
    });

    it('[21/26] POST /api/QuanLyPhim - Upload nhanh hình ảnh phim lên Cloudinary', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/QuanLyPhim?tenPhim=Phim%20E2E%20Updated')
        .attach('file', SAMPLE_GIF, 'banner.gif');
      expect(res.status).toBe(201);
      expect(asEnvelope<string>(res).content).toContain('cloudinary.com');
    });

    it('[22/26] DELETE /api/QuanLyPhim/XoaPhim - Gửi query { MaPhim } xóa mềm phim', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/QuanLyPhim/XoaPhim?MaPhim=${createdMovieId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(asEnvelope<string>(res).content).toBe('Xóa phim thành công!');
    });

    it('[23/26] DELETE /api/QuanLyPhim/XP - Gửi query { MaPhim } xóa mềm phim qua alias XP', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/QuanLyPhim/ThemPhimUploadHinh')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('tenPhim', 'Phim XP Alias')
        .attach('File', SAMPLE_GIF, 'xp.gif');
      xpMovieId = asEnvelope<{ maPhim: number }>(createRes).content.maPhim;

      const res = await request(app.getHttpServer())
        .delete(`/api/QuanLyPhim/XP?MaPhim=${xpMovieId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(asEnvelope<string>(res).content).toBe('Xóa phim thành công!');
    });
  });

  describe('3. QuanLyRap (4/4 Endpoints)', () => {
    it('[24/26] GET /api/QuanLyRap/LayThongTinHeThongRap - Gửi query { maHeThongRap } & nhận danh sách thương hiệu rạp', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyRap/LayThongTinHeThongRap?maHeThongRap=CGV',
      );
      expect(res.status).toBe(200);
      const body =
        asEnvelope<
          Array<{ maHeThongRap: string; tenHeThongRap: string; logo: string }>
        >(res);
      expect(body.content).toHaveLength(1);
      expect(body.content[0].maHeThongRap).toBe('CGV');
    });

    it('[25/26] GET /api/QuanLyRap/LayThongTinCumRapTheoHeThong - Gửi query { maHeThongRap } & nhận danh sách cụm rạp + phòng chiếu', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyRap/LayThongTinCumRapTheoHeThong?maHeThongRap=CGV',
      );
      expect(res.status).toBe(200);
      const body = asEnvelope<
        Array<{
          maCumRap: string;
          tenCumRap: string;
          danhSachRap: Array<{ maRap: number; tenRap: string }>;
        }>
      >(res);
      expect(body.content.length).toBeGreaterThanOrEqual(1);
      expect(body.content[0].danhSachRap.length).toBeGreaterThanOrEqual(1);
    });

    it('[26/26-A] GET /api/QuanLyRap/LayThongTinLichChieuHeThongRap - Nhận cây lịch chiếu 4 tầng toàn hệ thống', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyRap/LayThongTinLichChieuHeThongRap?maHeThongRap=CGV',
      );
      expect(res.status).toBe(200);
      const body = asEnvelope<
        Array<{
          maHeThongRap: string;
          lstCumRap: Array<{
            danhSachPhim: Array<{
              maPhim: number;
              lstLichChieuTheoPhim: Array<{ maLichChieu: number }>;
            }>;
          }>;
        }>
      >(res);
      expect(body.content[0].maHeThongRap).toBe('CGV');
      expect(
        body.content[0].lstCumRap[0].danhSachPhim[0].lstLichChieuTheoPhim[0]
          .maLichChieu,
      ).toBe(1);
    });

    it('[26/26-B] GET /api/QuanLyRap/LayThongTinLichChieuPhim - Gửi query { MaPhim } & nhận lịch chiếu gom theo rạp', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyRap/LayThongTinLichChieuPhim?MaPhim=1',
      );
      expect(res.status).toBe(200);
      const body = asEnvelope<{
        maPhim: number;
        tenPhim: string;
        heThongRapChieu: Array<{ maHeThongRap: string }>;
      }>(res);
      expect(body.content.maPhim).toBe(1);
      expect(body.content.heThongRapChieu[0].maHeThongRap).toBe('CGV');
    });
  });

  describe('4. QuanLyDatVe (3/3 Endpoints)', () => {
    it('[DatVe 1/3] GET /api/QuanLyDatVe/LayDanhSachPhongVe - Gửi query { MaLichChieu } & nhận thongTinPhim + danhSachGhe', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/QuanLyDatVe/LayDanhSachPhongVe?MaLichChieu=1',
      );
      expect(res.status).toBe(200);
      const body = asEnvelope<{
        thongTinPhim: { maLichChieu: number; tenPhim: string };
        danhSachGhe: Array<{
          maGhe: number;
          tenGhe: string;
          daDat: boolean;
          taiKhoanNguoiDat: string | null;
        }>;
      }>(res);
      expect(body.content.thongTinPhim.maLichChieu).toBe(1);
      expect(body.content.danhSachGhe).toHaveLength(4);
      expect(body.content.danhSachGhe[0].daDat).toBe(true);
      expect(body.content.danhSachGhe[1].daDat).toBe(false);
    });

    it('[DatVe 2/3] POST /api/QuanLyDatVe/DatVe - Gửi payload { maLichChieu, danhSachVe } đặt ghế & chống đặt trùng', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/QuanLyDatVe/DatVe')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          maLichChieu: 1,
          danhSachVe: [{ maGhe: 3, giaVe: 110000 }],
        });
      expect(res.status).toBe(201);
      expect(asEnvelope<string>(res).content).toBe('Đặt vé thành công!');

      const duplicateRes = await request(app.getHttpServer())
        .post('/api/QuanLyDatVe/DatVe')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          maLichChieu: 1,
          danhSachVe: [{ maGhe: 3, giaVe: 110000 }],
        });
      expect(duplicateRes.status).toBe(400);
    });

    it('[DatVe 3/3] POST /api/QuanLyDatVe/TaoLichChieu - Gửi payload { maPhim, ngayChieuGioChieu, maRap, giaVe } tạo suất chiếu mới', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/QuanLyDatVe/TaoLichChieu')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          maPhim: 1,
          ngayChieuGioChieu: '2026-12-25 20:30:00',
          maRap: 1,
          giaVe: 125000,
        });
      expect(res.status).toBe(201);
      expect(asEnvelope<string>(res).content).toBe(
        'Tạo lịch chiếu thành công!',
      );
    });
  });
});
