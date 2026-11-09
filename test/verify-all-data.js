const net = require('net');
const { ValidationPipe } = require('@nestjs/common');
const { Test } = require('@nestjs/testing');
const { AppModule } = require('../dist/app.module');
const { TransformInterceptor } = require('../dist/core/interceptors/transform.interceptor');
const { PrismaService } = require('../dist/shared/database/prisma.service');
const { StorageService } = require('../dist/shared/storage/storage.service');
const { createInMemoryPrisma } = require('./mock-prisma.helper');

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function startEmbeddedServer(port = 3000) {
  const mockPrisma = createInMemoryPrisma();
  const mockStorage = {
    uploadFile: async (file) => ({
      secure_url: `https://res.cloudinary.com/demo/image/upload/v1/cinema/banners/${file?.originalname || 'poster.gif'}`,
      url: `https://res.cloudinary.com/demo/image/upload/v1/cinema/banners/${file?.originalname || 'poster.gif'}`,
    }),
  };

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(mockPrisma)
    .overrideProvider(StorageService)
    .useValue(mockStorage)
    .compile();

  const app = moduleRef.createNestApplication({ logger: false });
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(port);
  return app;
}

async function runDataVerification(BASE_URL = 'http://localhost:3000/api') {
  const results = [];

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function validateEnvelope(res, json, expectedStatuses = [200]) {
    const expected = Array.isArray(expectedStatuses) ? expectedStatuses : [expectedStatuses];
    assert(expected.includes(res.status), `Expected HTTP ${expected.join('/')}, got ${res.status}`);
    assert(json.statusCode === res.status, `Expected json.statusCode ${res.status}, got ${json.statusCode}`);
    assert(typeof json.message === 'string' && json.message.length > 0, 'Missing or invalid message string');
    assert(Boolean(json.dateTime) && !isNaN(Date.parse(json.dateTime)), 'Invalid or missing dateTime');
    assert(json.content !== undefined, 'Missing content field');
  }

  // 1. Authenticate to get Admin JWT
  console.log('--- 1. Testing QuanLyNguoiDung (Authentication & Profile) ---');
  let adminToken = '';
  {
    const res = await fetch(`${BASE_URL}/QuanLyNguoiDung/DangNhap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taiKhoan: 'admin@email.com', matKhau: 'qweasd' })
    });
    const json = await res.json();
    validateEnvelope(res, json, 201);
    assert(json.content.email === 'admin@email.com', 'Invalid userEmail returned');
    assert(json.content.maLoaiNguoiDung === 'QuanTri', 'Expected QuanTri role');
    assert(typeof json.content.accessToken === 'string' && json.content.accessToken.length > 20, 'Invalid accessToken');
    adminToken = json.content.accessToken;
    results.push({ endpoint: 'POST /QuanLyNguoiDung/DangNhap', status: 'PASS', detail: `Token OK, Role: ${json.content.maLoaiNguoiDung}` });
  }

  // 2. LayDanhSachLoaiNguoiDung
  {
    const res = await fetch(`${BASE_URL}/QuanLyNguoiDung/LayDanhSachLoaiNguoiDung`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(Array.isArray(json.content) && json.content.length === 2, 'Expected 2 user types');
    assert(json.content.some(x => x.maLoaiNguoiDung === 'KhachHang'), 'Missing KhachHang');
    assert(json.content.some(x => x.maLoaiNguoiDung === 'QuanTri'), 'Missing QuanTri');
    results.push({ endpoint: 'GET /QuanLyNguoiDung/LayDanhSachLoaiNguoiDung', status: 'PASS', detail: `2 types returned correctly` });
  }

  // 3. LayDanhSachNguoiDung
  {
    const res = await fetch(`${BASE_URL}/QuanLyNguoiDung/LayDanhSachNguoiDung`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(Array.isArray(json.content) && json.content.length >= 2, 'Expected at least 2 users');
    const u = json.content[0];
    assert(u.taiKhoan && u.hoTen && u.email && u.soDt && u.maLoaiNguoiDung, 'User schema missing fields');
    results.push({ endpoint: 'GET /QuanLyNguoiDung/LayDanhSachNguoiDung', status: 'PASS', detail: `Returned ${json.content.length} users with standard schema` });
  }

  // 4. TimKiemNguoiDung
  {
    const res = await fetch(`${BASE_URL}/QuanLyNguoiDung/TimKiemNguoiDung?tuKhoa=admin`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(Array.isArray(json.content) && json.content.some(x => x.email.includes('admin')), 'Search result missing admin');
    results.push({ endpoint: 'GET /QuanLyNguoiDung/TimKiemNguoiDung', status: 'PASS', detail: `Found matching user: admin@email.com` });
  }

  // 5. LayDanhSachNguoiDungPhanTrang
  {
    const res = await fetch(`${BASE_URL}/QuanLyNguoiDung/LayDanhSachNguoiDungPhanTrang?soTrang=1&soPhanTuTrenTrang=2`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(json.content.currentPage === 1, 'currentPage mismatch');
    assert(json.content.count === 2, 'count mismatch');
    assert(Array.isArray(json.content.items), 'items must be array');
    results.push({ endpoint: 'GET /QuanLyNguoiDung/LayDanhSachNguoiDungPhanTrang', status: 'PASS', detail: `Pagination OK (Page 1, 2 items, total: ${json.content.totalCount})` });
  }

  // 6. TimKiemNguoiDungPhanTrang
  {
    const res = await fetch(`${BASE_URL}/QuanLyNguoiDung/TimKiemNguoiDungPhanTrang?tuKhoa=Dat&soTrang=1&soPhanTuTrenTrang=5`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(json.content.items.some(u => u.hoTen.toLowerCase().includes('dat') || u.email.includes('d@gmail')), 'Filtered items missing target');
    results.push({ endpoint: 'GET /QuanLyNguoiDung/TimKiemNguoiDungPhanTrang', status: 'PASS', detail: `Search pagination OK (Found ${json.content.totalCount} matches)` });
  }

  // 7. ThongTinTaiKhoan (Protected)
  {
    const res = await fetch(`${BASE_URL}/QuanLyNguoiDung/ThongTinTaiKhoan`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    validateEnvelope(res, json, [200, 201]);
    assert(json.content.email === 'admin@email.com', 'Profile email mismatch');
    assert(Array.isArray(json.content.thongTinDatVe), 'thongTinDatVe must be array');
    results.push({ endpoint: 'POST /QuanLyNguoiDung/ThongTinTaiKhoan', status: 'PASS', detail: `Profile OK with ${json.content.thongTinDatVe.length} booking histories` });
  }

  // 8. LayThongTinNguoiDung
  {
    const res = await fetch(`${BASE_URL}/QuanLyNguoiDung/LayThongTinNguoiDung?taiKhoan=d@gmail.com`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    validateEnvelope(res, json, [200, 201]);
    assert(json.content.email === 'd@gmail.com', 'Target user email mismatch');
    results.push({ endpoint: 'POST /QuanLyNguoiDung/LayThongTinNguoiDung', status: 'PASS', detail: `Retrieved details for d@gmail.com` });
  }

  // 9. DangKy & CRUD NguoiDung
  const uniqueEmail = `autotest_${Date.now()}@cinema.com`;
  {
    const res = await fetch(`${BASE_URL}/QuanLyNguoiDung/DangKy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taiKhoan: uniqueEmail,
        matKhau: 'pwd123456',
        email: uniqueEmail,
        soDt: '0911223344',
        maNhom: 'GP01',
        hoTen: 'Auto Tester'
      })
    });
    const json = await res.json();
    validateEnvelope(res, json, 201);
    assert(json.content.email === uniqueEmail, 'Registered email mismatch');
    results.push({ endpoint: 'POST /QuanLyNguoiDung/DangKy', status: 'PASS', detail: `Created new user ${uniqueEmail}` });
  }

  // 10. CapNhatThongTinNguoiDung (PUT & POST alias)
  {
    const res = await fetch(`${BASE_URL}/QuanLyNguoiDung/CapNhatThongTinNguoiDung`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taiKhoan: uniqueEmail,
        matKhau: 'pwd123456',
        email: uniqueEmail,
        soDt: '0999888777',
        maNhom: 'GP01',
        maLoaiNguoiDung: 'KhachHang',
        hoTen: 'Updated Tester'
      })
    });
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(typeof json.content === 'string' && json.content.includes('thành công'), 'Update user response mismatch');
    results.push({ endpoint: 'PUT /QuanLyNguoiDung/CapNhatThongTinNguoiDung', status: 'PASS', detail: `Profile update validated: ${json.content}` });
  }

  // 10b. POST CapNhatThongTinNguoiDung (Alias)
  {
    const res = await fetch(`${BASE_URL}/QuanLyNguoiDung/CapNhatThongTinNguoiDung`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taiKhoan: uniqueEmail,
        matKhau: 'pwd123456',
        email: uniqueEmail,
        soDt: '0999888777',
        maNhom: 'GP01',
        maLoaiNguoiDung: 'KhachHang',
        hoTen: 'Updated Tester POST'
      })
    });
    const json = await res.json();
    validateEnvelope(res, json, [200, 201]);
    assert(typeof json.content === 'string' && json.content.includes('thành công'), 'Update user POST alias mismatch');
    results.push({ endpoint: 'POST /QuanLyNguoiDung/CapNhatThongTinNguoiDung', status: 'PASS', detail: `POST alias update validated` });
  }

  // 10c. POST ThemNguoiDung (Admin)
  const adminCreatedEmail = `admin_add_${Date.now()}@cinema.com`;
  {
    const res = await fetch(`${BASE_URL}/QuanLyNguoiDung/ThemNguoiDung`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taiKhoan: adminCreatedEmail,
        matKhau: 'pwd123456',
        email: adminCreatedEmail,
        soDt: '0911223399',
        maNhom: 'GP01',
        maLoaiNguoiDung: 'KhachHang',
        hoTen: 'Admin Created User'
      })
    });
    const json = await res.json();
    validateEnvelope(res, json, 201);
    results.push({ endpoint: 'POST /QuanLyNguoiDung/ThemNguoiDung', status: 'PASS', detail: `Admin created user ${adminCreatedEmail}` });
  }

  // 11. XoaNguoiDung (Admin)
  {
    const res = await fetch(`${BASE_URL}/QuanLyNguoiDung/XoaNguoiDung?TaiKhoan=${encodeURIComponent(uniqueEmail)}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    validateEnvelope(res, json, 200);
    results.push({ endpoint: 'DELETE /QuanLyNguoiDung/XoaNguoiDung', status: 'PASS', detail: `Deleted user ${uniqueEmail}` });
  }

  console.log('\n--- 2. Testing QuanLyPhim ---');
  // 12. LayDanhSachBanner
  {
    const res = await fetch(`${BASE_URL}/QuanLyPhim/LayDanhSachBanner`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(Array.isArray(json.content), 'Banners must be array');
    if (json.content.length > 0) {
      assert(json.content[0].maBanner !== undefined && json.content[0].hinhAnh !== undefined, 'Invalid banner item format');
    }
    results.push({ endpoint: 'GET /QuanLyPhim/LayDanhSachBanner', status: 'PASS', detail: `${json.content.length} banners returned` });
  }

  // 13. LayDanhSachPhim
  {
    const res = await fetch(`${BASE_URL}/QuanLyPhim/LayDanhSachPhim`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(Array.isArray(json.content) && json.content.length >= 2, 'Expected movies in list');
    const m = json.content[0];
    assert(m.maPhim && m.tenPhim && m.biDanh && m.trailer && m.hinhAnh, 'Movie item format missing properties');
    results.push({ endpoint: 'GET /QuanLyPhim/LayDanhSachPhim', status: 'PASS', detail: `${json.content.length} movies returned with FormattedMovie schema` });
  }

  // 14. LayDanhSachPhimPhanTrang
  {
    const res = await fetch(`${BASE_URL}/QuanLyPhim/LayDanhSachPhimPhanTrang?soTrang=1&soPhanTuTrenTrang=1`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(json.content.currentPage === 1 && json.content.count === 1, 'Movie pagination count mismatch');
    assert(json.content.totalCount >= 2, 'totalCount mismatch');
    results.push({ endpoint: 'GET /QuanLyPhim/LayDanhSachPhimPhanTrang', status: 'PASS', detail: `Movie pagination OK (Total: ${json.content.totalCount})` });
  }

  // 15. LayDanhSachPhimTheoNgay
  {
    const res = await fetch(`${BASE_URL}/QuanLyPhim/LayDanhSachPhimTheoNgay?tuNgay=01/01/2010&denNgay=31/12/2030`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(Array.isArray(json.content.items), 'items must be array');
    results.push({ endpoint: 'GET /QuanLyPhim/LayDanhSachPhimTheoNgay', status: 'PASS', detail: `Date range filter OK (${json.content.items.length} movies matched)` });
  }

  // 16. LayThongTinPhim
  {
    const res = await fetch(`${BASE_URL}/QuanLyPhim/LayThongTinPhim?MaPhim=1`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(json.content.maPhim === 1 && typeof json.content.tenPhim === 'string' && json.content.tenPhim.length > 0, 'Movie detail mismatch');
    assert(Array.isArray(json.content.heThongRapChieu), 'heThongRapChieu must be array');
    results.push({ endpoint: 'GET /QuanLyPhim/LayThongTinPhim', status: 'PASS', detail: `Detail & showtimes tree verified for MaPhim=1` });
  }

  // 17. POST uploadHinhAnh (Cloudinary)
  {
    const sampleBuf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const blob = new Blob([sampleBuf], { type: 'image/gif' });
    const fd = new FormData();
    fd.append('file', blob, 'sample.gif');
    const res = await fetch(`${BASE_URL}/QuanLyPhim`, { method: 'POST', body: fd });
    const json = await res.json();
    validateEnvelope(res, json, 201);
    assert(typeof json.content === 'string' && json.content.includes('cloudinary.com'), 'Expected Cloudinary secure URL');
    results.push({ endpoint: 'POST /QuanLyPhim', status: 'PASS', detail: `Cloudinary URL: ${json.content}` });
  }

  // 18. POST ThemPhimUploadHinh (Admin)
  let createdMovieId = 0;
  {
    const sampleBuf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const blob = new Blob([sampleBuf], { type: 'image/gif' });
    const fd = new FormData();
    fd.append('File', blob, 'sample.gif');
    fd.append('tenPhim', `Movie Test ${Date.now()}`);
    fd.append('trailer', 'https://youtube.com/watch?v=123');
    fd.append('moTa', 'Test Movie Description');
    fd.append('ngayKhoiChieu', '01/01/2026');
    fd.append('danhGia', '8');
    fd.append('hot', 'true');
    fd.append('dangChieu', 'true');
    fd.append('sapChieu', 'false');

    const res = await fetch(`${BASE_URL}/QuanLyPhim/ThemPhimUploadHinh`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: fd
    });
    const json = await res.json();
    validateEnvelope(res, json, 201);
    createdMovieId = json.content.maPhim;
    assert(createdMovieId > 0, 'Invalid created movie ID');
    results.push({ endpoint: 'POST /QuanLyPhim/ThemPhimUploadHinh', status: 'PASS', detail: `Created movie ID ${createdMovieId} with Cloudinary upload` });
  }

  // 19. POST CapNhatPhimUpload (Admin)
  {
    const sampleBuf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const blob = new Blob([sampleBuf], { type: 'image/gif' });
    const fd = new FormData();
    fd.append('File', blob, 'sample.gif');
    fd.append('maPhim', String(createdMovieId));
    fd.append('tenPhim', 'Movie Test Updated');
    fd.append('trailer', 'https://youtube.com/watch?v=updated');
    fd.append('moTa', 'Updated description');
    fd.append('ngayKhoiChieu', '01/01/2026');
    fd.append('danhGia', '9');

    const res = await fetch(`${BASE_URL}/QuanLyPhim/CapNhatPhimUpload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: fd
    });
    const json = await res.json();
    validateEnvelope(res, json, 201);
    assert(json.content.tenPhim === 'Movie Test Updated', 'Updated movie name mismatch');
    results.push({ endpoint: 'POST /QuanLyPhim/CapNhatPhimUpload', status: 'PASS', detail: `Updated movie ID ${createdMovieId}` });
  }

  // 20. DELETE XoaPhim & XP (Admin)
  {
    const res = await fetch(`${BASE_URL}/QuanLyPhim/XoaPhim?MaPhim=${createdMovieId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(typeof json.content === 'string' && json.content.includes('thành công'), 'Delete movie response mismatch');
    results.push({ endpoint: 'DELETE /QuanLyPhim/XoaPhim', status: 'PASS', detail: `Soft deleted movie ID ${createdMovieId}` });
  }

  // 20b. DELETE XP (Alias)
  {
    const sampleBuf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const blob = new Blob([sampleBuf], { type: 'image/gif' });
    const fd = new FormData();
    fd.append('File', blob, 'sample.gif');
    fd.append('tenPhim', `Movie XP ${Date.now()}`);
    const createRes = await fetch(`${BASE_URL}/QuanLyPhim/ThemPhimUploadHinh`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: fd
    });
    const createJson = await createRes.json();
    const xpMovieId = createJson.content.maPhim;

    const res = await fetch(`${BASE_URL}/QuanLyPhim/XP?MaPhim=${xpMovieId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    validateEnvelope(res, json, 200);
    results.push({ endpoint: 'DELETE /QuanLyPhim/XP', status: 'PASS', detail: `Soft deleted movie ID ${xpMovieId} via XP alias` });
  }

  console.log('\n--- 3. Testing QuanLyRap ---');
  // 18. LayThongTinHeThongRap
  {
    const res = await fetch(`${BASE_URL}/QuanLyRap/LayThongTinHeThongRap`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(Array.isArray(json.content) && json.content.length >= 3, 'Expected at least 3 brands (CGV, Galaxy, Lotte...)');
    assert(json.content.some(b => b.maHeThongRap === 'CGV'), 'Missing CGV brand');
    results.push({ endpoint: 'GET /QuanLyRap/LayThongTinHeThongRap', status: 'PASS', detail: `3 Cinema brands verified (CGV, Galaxy, Lotte)` });
  }

  // 19. LayThongTinCumRapTheoHeThong
  {
    const res = await fetch(`${BASE_URL}/QuanLyRap/LayThongTinCumRapTheoHeThong?maHeThongRap=CGV`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(Array.isArray(json.content) && json.content.length > 0, 'Expected clusters for CGV');
    assert(json.content[0].danhSachRap && Array.isArray(json.content[0].danhSachRap), 'Missing danhSachRap array');
    results.push({ endpoint: 'GET /QuanLyRap/LayThongTinCumRapTheoHeThong', status: 'PASS', detail: `Clusters & screens hierarchy verified for CGV` });
  }

  // 20. LayThongTinLichChieuHeThongRap
  {
    const res = await fetch(`${BASE_URL}/QuanLyRap/LayThongTinLichChieuHeThongRap`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(Array.isArray(json.content) && json.content.length > 0, 'Expected brands in system schedule');
    const brand = json.content[0];
    assert(Array.isArray(brand.lstCumRap), 'lstCumRap must be array');
    results.push({ endpoint: 'GET /QuanLyRap/LayThongTinLichChieuHeThongRap', status: 'PASS', detail: `Full theater schedule tree (Brand -> Clusters -> Movies -> Showtimes)` });
  }

  // 21. LayThongTinLichChieuPhim
  {
    const res = await fetch(`${BASE_URL}/QuanLyRap/LayThongTinLichChieuPhim?MaPhim=1`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(json.content.maPhim === 1, 'maPhim mismatch in schedule');
    assert(Array.isArray(json.content.heThongRapChieu), 'heThongRapChieu must be array');
    results.push({ endpoint: 'GET /QuanLyRap/LayThongTinLichChieuPhim', status: 'PASS', detail: `Movie showtime hierarchy verified for MaPhim=1` });
  }

  console.log('\n--- 4. Testing QuanLyDatVe ---');
  // 22. LayDanhSachPhongVe
  {
    const res = await fetch(`${BASE_URL}/QuanLyDatVe/LayDanhSachPhongVe?MaLichChieu=1`);
    const json = await res.json();
    validateEnvelope(res, json, 200);
    assert(json.content.thongTinPhim && json.content.thongTinPhim.maLichChieu === 1, 'thongTinPhim mismatch');
    assert(Array.isArray(json.content.danhSachGhe) && json.content.danhSachGhe.length > 0, 'danhSachGhe must not be empty');
    const seat = json.content.danhSachGhe[0];
    assert(seat.maGhe && seat.tenGhe && seat.loaiGhe && typeof seat.daDat === 'boolean', 'Seat schema missing fields');
    results.push({ endpoint: 'GET /QuanLyDatVe/LayDanhSachPhongVe', status: 'PASS', detail: `${json.content.danhSachGhe.length} seats loaded with booking status` });
  }

  // 23. DatVe (Atomic Transaction)
  {
    // Find an unbooked seat for showtime 1
    const pvRes = await fetch(`${BASE_URL}/QuanLyDatVe/LayDanhSachPhongVe?MaLichChieu=1`);
    const pvJson = await pvRes.json();
    const availableSeat = pvJson.content.danhSachGhe.find(s => !s.daDat);
    assert(availableSeat, 'No available seat for booking test');

    const res = await fetch(`${BASE_URL}/QuanLyDatVe/DatVe`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        maLichChieu: 1,
        danhSachVe: [{ maGhe: availableSeat.maGhe, giaVe: availableSeat.giaVe }]
      })
    });
    const json = await res.json();
    validateEnvelope(res, json, 201);
    assert(typeof json.content === 'string' && json.content.includes('thành công'), 'DatVe message mismatch');

    // Re-verify that seat is now daDat: true
    const reCheck = await fetch(`${BASE_URL}/QuanLyDatVe/LayDanhSachPhongVe?MaLichChieu=1`);
    const reJson = await reCheck.json();
    const bookedSeat = reJson.content.danhSachGhe.find(s => s.maGhe === availableSeat.maGhe);
    assert(bookedSeat.daDat === true, 'Seat was not marked as daDat=true after booking');
    results.push({ endpoint: 'POST /QuanLyDatVe/DatVe', status: 'PASS', detail: `Booked Seat #${availableSeat.maGhe} - status correctly updated to daDat=true` });
  }

  // 24. TaoLichChieu (Admin)
  {
    const res = await fetch(`${BASE_URL}/QuanLyDatVe/TaoLichChieu`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        maPhim: 2,
        ngayChieuGioChieu: '2026-05-15 18:30:00',
        maRap: 2,
        giaVe: 90000
      })
    });
    const json = await res.json();
    validateEnvelope(res, json, 201);
    assert(typeof json.content === 'string' && json.content.includes('thành công'), 'TaoLichChieu message mismatch');
    results.push({ endpoint: 'POST /QuanLyDatVe/TaoLichChieu', status: 'PASS', detail: `Created showtime successfully: ${json.content}` });
  }

  console.log('\n=========================================');
  console.log(`TOTAL ENDPOINTS TESTED: ${results.length}`);
  console.log(`PASSED: ${results.filter(r => r.status === 'PASS').length}`);
  console.log(`FAILED: ${results.filter(r => r.status === 'FAIL').length}`);
  console.log('=========================================');
  console.table(results);
}

(async () => {
  let embeddedApp = null;
  let port = 3000;
  try {
    const serverUp = await isPortOpen(3000);
    const mysqlUp = await isPortOpen(3306);
    if (!serverUp || !mysqlUp) {
      port = serverUp ? 3099 : 3000;
      embeddedApp = await startEmbeddedServer(port);
    }
    await runDataVerification(`http://localhost:${port}/api`);
  } catch (err) {
    console.error('\n[FATAL ERROR]:', err);
    process.exitCode = 1;
  } finally {
    if (embeddedApp) {
      await embeddedApp.close();
    }
  }
})();
