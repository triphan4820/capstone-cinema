function createInMemoryPrisma() {
  const state = {
    movies: [
      {
        movieId: 1,
        movieName: 'Dune: Hành Tinh Cát - Phần Hai',
        movieTrailer: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        movieImage: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        movieDescription: 'Paul Atreides hợp nhất với người Fremen và bắt đầu cuộc hành trình trả thù những kẻ đã hủy hoại gia tộc mình.',
        dateRelease: new Date('2026-03-01T00:00:00Z'),
        movieRating: 10,
        isTrending: true,
        isShowing: true,
        isUpcoming: false,
        isDeleted: false,
      },
      {
        movieId: 2,
        movieName: 'Oppenheimer',
        movieTrailer: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        movieImage: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        movieDescription: 'Câu chuyện về nhà vật lý lý thuyết J. Robert Oppenheimer và vai trò của ông trong Dự án Manhattan chế tạo bom nguyên tử.',
        dateRelease: new Date('2026-03-15T00:00:00Z'),
        movieRating: 9,
        isTrending: true,
        isShowing: true,
        isUpcoming: false,
        isDeleted: false,
      },
      {
        movieId: 3,
        movieName: 'Spider-Man: Du Hành Vũ Trụ Nhện',
        movieTrailer: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        movieImage: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        movieDescription: 'Miles Morales tái hợp với Gwen Stacy và du hành qua Đa vũ trụ.',
        dateRelease: new Date('2026-04-10T00:00:00Z'),
        movieRating: 9,
        isTrending: true,
        isShowing: true,
        isUpcoming: false,
        isDeleted: false,
      },
    ],
    banners: [
      { bannerId: 1, movieId: 1, bannerImage: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg', isDeleted: false },
      { bannerId: 2, movieId: 2, bannerImage: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg', isDeleted: false },
    ],
    brands: [
      { brandId: 1, brandName: 'CGV', brandLogo: 'https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/web/logo_cgv.png', isDeleted: false },
      { brandId: 2, brandName: 'Galaxy', brandLogo: 'https://www.galaxycine.vn/_next/static/media/galaxy-logo-mobile.074abeac.png', isDeleted: false },
      { brandId: 3, brandName: 'Lotte', brandLogo: 'https://media.lottecinemavn.com/Media/WebAdmin/ccc95ee5b9274a12ba3e51317250dc98.png', isDeleted: false },
      { brandId: 4, brandName: 'BHDStar', brandLogo: 'https://www.bhdstar.vn/wp-content/themes/bhd/assets/images/logo.png', isDeleted: false },
    ],
    cinemas: [
      { cinemaId: 1, cinemaName: 'CGV Vincom Đồng Khởi', cinemaAddress: '72 Lê Thánh Tôn, Quận 1, TP.HCM', brandId: 1, isDeleted: false },
      { cinemaId: 2, cinemaName: 'Galaxy Nguyễn Du', cinemaAddress: '116 Nguyễn Du, Quận 1, TP.HCM', brandId: 2, isDeleted: false },
      { cinemaId: 3, cinemaName: 'Lotte Cinema Gò Vấp', cinemaAddress: '242 Nguyễn Văn Lượng, Gò Vấp, TP.HCM', brandId: 3, isDeleted: false },
      { cinemaId: 4, cinemaName: 'BHD Star Bitexco', cinemaAddress: '2 Hải Triều, Quận 1, TP.HCM', brandId: 4, isDeleted: false },
    ],
    screens: [
      { screenId: 1, screenName: 'Rạp IMAX 01', cinemaId: 1, isDeleted: false },
      { screenId: 2, screenName: 'Rạp Laser 01', cinemaId: 2, isDeleted: false },
      { screenId: 3, screenName: 'Rạp SuperPlex 01', cinemaId: 3, isDeleted: false },
      { screenId: 4, screenName: 'Rạp Onyx 01', cinemaId: 4, isDeleted: false },
    ],
    seats: [
      { seatId: 1, seatName: 'A01', seatType: 'Thuong', screenId: 1, isDeleted: false },
      { seatId: 2, seatName: 'A02', seatType: 'Thuong', screenId: 1, isDeleted: false },
      { seatId: 3, seatName: 'A03', seatType: 'Vip', screenId: 1, isDeleted: false },
      { seatId: 4, seatName: 'A04', seatType: 'Vip', screenId: 1, isDeleted: false },
      { seatId: 5, seatName: 'A01', seatType: 'Thuong', screenId: 2, isDeleted: false },
      { seatId: 6, seatName: 'A02', seatType: 'Vip', screenId: 2, isDeleted: false },
    ],
    users: [
      {
        userId: 1,
        userFullname: 'Nguyễn Thành Đạt',
        userEmail: 'd@gmail.com',
        userPhone: '0909123456',
        userPassword: '$2b$10$8s11cruMqzUSu46ARvSzf.yRpjNv5/BfZM1I9k/Z1c37HG54TTVV6',
        userType: 'user',
        isDeleted: false,
      },
      {
        userId: 2,
        userFullname: 'Quản Trị Hệ Thống',
        userEmail: 'admin@email.com',
        userPhone: '0909988776',
        userPassword: '$2b$10$8s11cruMqzUSu46ARvSzf.yRpjNv5/BfZM1I9k/Z1c37HG54TTVV6',
        userType: 'admin',
        isDeleted: false,
      },
    ],
    showtimes: [
      { showId: 1, screenId: 1, movieId: 1, showTime: new Date('2026-05-01T18:30:00Z'), bookingPrice: 110000, isDeleted: false },
      { showId: 2, screenId: 2, movieId: 2, showTime: new Date('2026-05-02T19:00:00Z'), bookingPrice: 120000, isDeleted: false },
    ],
    bookings: [
      { bookingId: 1, userId: 1, createAt: new Date('2026-04-20T10:00:00Z') },
    ],
    bookingDetails: [
      { detailId: 1, bookingId: 1, showId: 1, seatId: 1 },
    ],
  };

  function enrichScreen(screen) {
    if (!screen) return null;
    const cinema = state.cinemas.find((c) => c.cinemaId === screen.cinemaId) || null;
    const brand = cinema ? state.brands.find((b) => b.brandId === cinema.brandId) || null : null;
    return {
      ...screen,
      Cinemas: cinema ? { ...cinema, Brands: brand } : null,
      Seats: state.seats.filter((s) => s.screenId === screen.screenId && !s.isDeleted),
    };
  }

  function enrichShowtime(st) {
    if (!st) return null;
    return {
      ...st,
      Movies: state.movies.find((m) => m.movieId === st.movieId) || null,
      Screens: enrichScreen(state.screens.find((s) => s.screenId === st.screenId)),
      BookingDetail: state.bookingDetails
        .filter((d) => d.showId === st.showId)
        .map((d) => ({
          ...d,
          Booking: state.bookings.find((b) => b.bookingId === d.bookingId) || null,
        })),
    };
  }

  function norm(str = '') {
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase();
  }

  function matchUserWhere(u, where = {}) {
    if (where.isDeleted !== undefined && u.isDeleted !== where.isDeleted) return false;
    if (where.userId !== undefined) {
      if (typeof where.userId === 'object' && Array.isArray(where.userId.in)) {
        if (!where.userId.in.includes(u.userId)) return false;
      } else if (u.userId !== where.userId) {
        return false;
      }
    }
    if (where.userEmail !== undefined && u.userEmail !== where.userEmail) return false;
    if (Array.isArray(where.OR)) {
      const orMatched = where.OR.some((cond) => {
        if (cond.userEmail && typeof cond.userEmail === 'string') return u.userEmail === cond.userEmail;
        if (cond.userEmail?.contains) return norm(u.userEmail).includes(norm(cond.userEmail.contains));
        if (cond.userFullname?.contains) return norm(u.userFullname).includes(norm(cond.userFullname.contains));
        if (cond.userId !== undefined) return u.userId === cond.userId;
        return false;
      });
      if (!orMatched) return false;
    }
    return true;
  }

  function matchMovieWhere(m, where = {}) {
    if (where.isDeleted !== undefined && m.isDeleted !== where.isDeleted) return false;
    if (where.movieId !== undefined && m.movieId !== where.movieId) return false;
    if (where.movieName) {
      if (typeof where.movieName === 'string' && m.movieName !== where.movieName) return false;
      if (where.movieName.contains && !m.movieName.toLowerCase().includes(where.movieName.contains.toLowerCase())) return false;
    }
    if (where.dateRelease) {
      if (where.dateRelease.gte && m.dateRelease < where.dateRelease.gte) return false;
      if (where.dateRelease.lte && m.dateRelease > where.dateRelease.lte) return false;
    }
    return true;
  }

  const prisma = {
    users: {
      findFirst: async ({ where }) => state.users.find((u) => matchUserWhere(u, where)) || null,
      findUnique: async ({ where }) => state.users.find((u) => matchUserWhere(u, where)) || null,
      findMany: async ({ where, skip = 0, take = 100 } = {}) =>
        state.users.filter((u) => matchUserWhere(u, where)).slice(skip, skip + take),
      count: async ({ where } = {}) => state.users.filter((u) => matchUserWhere(u, where)).length,
      create: async ({ data }) => {
        const nextId = state.users.length + 1;
        const created = { userId: nextId, isDeleted: false, ...data };
        state.users.push(created);
        return created;
      },
      update: async ({ where, data }) => {
        const user = state.users.find((u) => u.userId === where.userId);
        if (!user) return null;
        Object.entries(data).forEach(([k, v]) => {
          if (v !== undefined) user[k] = v;
        });
        return user;
      },
    },
    banners: {
      findMany: async ({ where } = {}) =>
        state.banners.filter((b) => (where?.isDeleted !== undefined ? b.isDeleted === where.isDeleted : true)),
    },
    movies: {
      findMany: async ({ where, skip = 0, take = 100 } = {}) =>
        state.movies
          .filter((m) => matchMovieWhere(m, where))
          .sort((a, b) => b.movieId - a.movieId)
          .slice(skip, skip + take),
      count: async ({ where } = {}) => state.movies.filter((m) => matchMovieWhere(m, where)).length,
      findUnique: async ({ where }) => {
        const m = state.movies.find((x) => matchMovieWhere(x, where));
        if (!m) return null;
        return {
          ...m,
          Showtime: state.showtimes
            .filter((s) => s.movieId === m.movieId && !s.isDeleted)
            .map(enrichShowtime),
        };
      },
      findFirst: async ({ where }) => state.movies.find((x) => matchMovieWhere(x, where)) || null,
      create: async ({ data }) => {
        const movieId = state.movies.length + 1;
        const created = { movieId, isDeleted: false, ...data };
        state.movies.push(created);
        return created;
      },
      update: async ({ where, data }) => {
        const movie = state.movies.find((m) => m.movieId === where.movieId);
        if (!movie) return null;
        Object.entries(data).forEach(([k, v]) => {
          if (v !== undefined) movie[k] = v;
        });
        return movie;
      },
    },
    brands: {
      findMany: async ({ where } = {}) => {
        return state.brands
          .filter((b) => {
            if (where?.isDeleted !== undefined && b.isDeleted !== where.isDeleted) return false;
            if (Array.isArray(where?.OR)) {
              return where.OR.some((c) => {
                if (c.brandName?.contains) return b.brandName.toLowerCase().includes(c.brandName.contains.toLowerCase());
                if (c.brandId !== undefined) return b.brandId === c.brandId;
                return false;
              });
            }
            if (where?.brandName?.contains) {
              return b.brandName.toLowerCase().includes(where.brandName.contains.toLowerCase());
            }
            return true;
          })
          .map((brand) => ({
            ...brand,
            Cinemas: state.cinemas
              .filter((c) => c.brandId === brand.brandId && !c.isDeleted)
              .map((cinema) => ({
                ...cinema,
                Screens: state.screens
                  .filter((s) => s.cinemaId === cinema.cinemaId && !s.isDeleted)
                  .map((screen) => ({
                    ...screen,
                    Showtime: state.showtimes
                      .filter((st) => st.screenId === screen.screenId && !st.isDeleted)
                      .map(enrichShowtime),
                  })),
              })),
          }));
      },
    },
    cinemas: {
      findMany: async ({ where } = {}) => {
        return state.cinemas
          .filter((c) => {
            if (where?.isDeleted !== undefined && c.isDeleted !== where.isDeleted) return false;
            const brand = state.brands.find((b) => b.brandId === c.brandId);
            if (!brand) return false;
            if (Array.isArray(where?.Brands?.OR)) {
              return where.Brands.OR.some((cond) => {
                if (cond.brandName?.contains) return brand.brandName.toLowerCase().includes(cond.brandName.contains.toLowerCase());
                if (cond.brandId !== undefined) return brand.brandId === cond.brandId;
                return false;
              });
            }
            if (where?.Brands?.brandName?.contains) {
              return brand.brandName.toLowerCase().includes(where.Brands.brandName.contains.toLowerCase());
            }
            return true;
          })
          .map((c) => ({
            ...c,
            Screens: state.screens.filter((s) => s.cinemaId === c.cinemaId && !s.isDeleted),
          }));
      },
    },
    screens: {
      findUnique: async ({ where }) =>
        state.screens.find((s) => s.screenId === where.screenId && !s.isDeleted) || null,
      findFirst: async ({ where }) =>
        state.screens.find((s) => s.cinemaId === where.cinemaId && !s.isDeleted) || null,
    },
    showtime: {
      findUnique: async ({ where }) => {
        const st = state.showtimes.find((s) => s.showId === where.showId && !s.isDeleted);
        return enrichShowtime(st);
      },
      create: async ({ data }) => {
        const showId = state.showtimes.length + 1;
        const created = { showId, isDeleted: false, ...data };
        state.showtimes.push(created);
        return created;
      },
    },
    booking: {
      findMany: async ({ where }) => {
        return state.bookings
          .filter((b) => b.userId === where.userId)
          .map((b) => ({
            ...b,
            BookingDetail: state.bookingDetails
              .filter((d) => d.bookingId === b.bookingId)
              .map((d) => ({
                ...d,
                Showtime: enrichShowtime(state.showtimes.find((s) => s.showId === d.showId)),
                Seats: state.seats.find((seat) => seat.seatId === d.seatId) || null,
              })),
          }));
      },
      create: async ({ data }) => {
        const bookingId = state.bookings.length + 1;
        const created = { bookingId, userId: data.userId, createAt: new Date() };
        state.bookings.push(created);
        if (data.BookingDetail?.create) {
          for (const item of data.BookingDetail.create) {
            state.bookingDetails.push({
              detailId: state.bookingDetails.length + 1,
              bookingId,
              showId: item.showId,
              seatId: item.seatId,
            });
          }
        }
        return created;
      },
    },
    bookingDetail: {
      findMany: async ({ where }) => {
        return state.bookingDetails.filter(
          (d) => d.showId === where.showId && where.seatId.in.includes(d.seatId),
        );
      },
    },
    $transaction: async (cb) => cb(prisma),
  };

  return prisma;
}

module.exports = { createInMemoryPrisma };
