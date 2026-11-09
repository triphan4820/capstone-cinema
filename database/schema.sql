-- CREATE TABLE
CREATE TABLE
    IF NOT EXISTS `Movies` (
        `movieId` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        `movieName` VARCHAR(255) NOT NULL,
        `movieTrailer` VARCHAR(255),
        `movieImage` VARCHAR(255),
        `movieDescription` TEXT,
        `dateRelease` DATETIME,
        `movieRating` INT,
        `isTrending` BOOLEAN,
        `isShowing` BOOLEAN,
        `isUpcoming` BOOLEAN,
        `isDeleted` TINYINT (1) NOT NULL DEFAULT 0,
        `createAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updateAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `Banners` (
        `bannerId` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        `movieId` INT NOT NULL,
        `bannerImage` VARCHAR(255) NOT NULL,
        `isDeleted` TINYINT (1) NOT NULL DEFAULT 0,
        `createAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updateAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `Brands` (
        `brandId` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        `brandName` VARCHAR(255) NOT NULL,
        `brandLogo` VARCHAR(255),
        `isDeleted` TINYINT (1) NOT NULL DEFAULT 0,
        `createAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updateAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `Cinemas` (
        `cinemaId` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        `cinemaName` VARCHAR(255) NOT NULL,
        `cinemaAddress` VARCHAR(255),
        `brandId` INT,
        `isDeleted` TINYINT (1) NOT NULL DEFAULT 0,
        `createAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updateAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `Screens` (
        `screenId` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        `screenName` VARCHAR(255),
        `cinemaId` INT NOT NULL,
        `isDeleted` TINYINT (1) NOT NULL DEFAULT 0,
        `createAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updateAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `Seats` (
        `seatId` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        `seatName` CHAR(3) NOT NULL,
        `seatType` VARCHAR(255) NOT NULL,
        `screenId` INT NOT NULL,
        `isDeleted` TINYINT (1) NOT NULL DEFAULT 0,
        `createAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updateAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `Users` (
        `userId` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        `userFullname` VARCHAR(255),
        `userEmail` VARCHAR(255) NOT NULL UNIQUE,
        `userPhone` VARCHAR(255),
        `userPassword` VARCHAR(255) NOT NULL,
        `userType` VARCHAR(255),
        `isDeleted` TINYINT (1) NOT NULL DEFAULT 0,
        `createAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updateAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `Showtime` (
        `showId` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        `screenId` INT NOT NULL,
        `movieId` INT NOT NULL,
        `showTime` DATETIME NOT NULL,
        `bookingPrice` INT NOT NULL,
        `isDeleted` TINYINT (1) NOT NULL DEFAULT 0,
        `createAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updateAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `Booking` (
        `bookingId` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        `userId` INT NOT NULL,
        `createAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS `BookingDetail` (
        `detailId` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
        `bookingId` INT NOT NULL,
        `showId` INT NOT NULL,
        `seatId` INT NOT NULL,
        UNIQUE (`showId`, `seatId`)
    );

-- SET FK
ALTER TABLE `Banners`
ADD FOREIGN KEY (`movieId`) REFERENCES `Movies`(`movieId`);

ALTER TABLE `Cinemas`
ADD FOREIGN KEY (`brandId`) REFERENCES `Brands`(`brandId`);

ALTER TABLE `Screens`
ADD FOREIGN KEY (`cinemaId`) REFERENCES `Cinemas`(`cinemaId`);

ALTER TABLE `Seats`
ADD FOREIGN KEY (`screenId`) REFERENCES `Screens`(`screenId`);

ALTER TABLE `Showtime`
ADD FOREIGN KEY (`screenId`) REFERENCES `Screens`(`screenId`),
ADD FOREIGN KEY (`movieId`) REFERENCES `Movies`(`movieId`);

ALTER TABLE `Booking`
ADD FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`);

ALTER TABLE `BookingDetail`
ADD FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`bookingId`),
ADD FOREIGN KEY (`showId`) REFERENCES `Showtime`(`showId`),
ADD FOREIGN KEY (`seatId`) REFERENCES `Seats`(`seatId`);
-- SEED DATA (DỮ LIỆU MẪU)
INSERT INTO `Movies` (`movieName`, `movieTrailer`, `movieImage`, `movieDescription`, `dateRelease`, `movieRating`, `isTrending`, `isShowing`, `isUpcoming`)
VALUES
('Dune: Hành Tinh Cát - Phần Hai', 'https://www.youtube.com/watch?v=Way9Dexny3w', 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', 'Paul Atreides hợp nhất với người Fremen và bắt đầu cuộc hành trình trả thù những kẻ đã hủy hoại gia tộc mình.', '2026-03-01 00:00:00', 10, 1, 1, 0),
('Oppenheimer', 'https://www.youtube.com/watch?v=uYPbbksJxIg', 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', 'Câu chuyện về nhà vật lý lý thuyết J. Robert Oppenheimer và vai trò của ông trong Dự án Manhattan chế tạo bom nguyên tử.', '2026-03-15 00:00:00', 9, 1, 1, 0),
('Spider-Man: Du Hành Vũ Trụ Nhện', 'https://www.youtube.com/watch?v=cqGjhVJWtEg', 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', 'Miles Morales tái hợp với Gwen Stacy và du hành qua Đa vũ trụ, nơi cậu chạm trán Hội Nhện bảo vệ sự tồn tại của các thế giới.', '2026-04-10 00:00:00', 9, 1, 1, 0),
('Mai', 'https://www.youtube.com/watch?v=EX6clvId19s', 'https://image.tmdb.org/t/p/w500/t5zCBSB5xMDKcDqe91qahCOUYVV.jpg', 'Bộ phim tâm lý tình cảm xoay quanh cuộc đời nhiều biến cố của Mai và mối tình sâu đậm với Dương.', '2026-02-10 00:00:00', 8, 1, 1, 0),
('Lật Mặt 7: Một Điều Ước', 'https://www.youtube.com/watch?v=kBY2k3G6LsM', 'https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg', 'Câu chuyện cảm động về tình mẫu tử của bà Hai và hành trình gắn kết 5 người con ở những hoàn cảnh sống khác nhau.', '2026-04-26 00:00:00', 9, 0, 1, 0),
('Avatar 3: Lửa Và Tro Tàn', 'https://www.youtube.com/watch?v=d9MyW72ELq0', 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', 'Jake Sully và Neytiri tiếp tục khám phá những vùng đất mới trên hành tinh Pandora cùng tộc người Tro (Ash People).', '2026-12-18 00:00:00', 10, 1, 0, 1);

INSERT INTO `Banners` (`movieId`, `bannerImage`)
VALUES
(1, 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg'),
(2, 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg'),
(3, 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg'),
(6, 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg');

INSERT INTO `Brands` (`brandName`, `brandLogo`)
VALUES
('CGV', 'https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/web/logo_cgv.png'),
('Galaxy', 'https://www.galaxycine.vn/_next/static/media/galaxy-logo-mobile.074abeac.png'),
('Lotte', 'https://media.lottecinemavn.com/Media/WebAdmin/ccc95ee5b9274a12ba3e51317250dc98.png'),
('BHDStar', 'https://www.bhdstar.vn/wp-content/themes/bhd/assets/images/logo.png');

INSERT INTO `Cinemas` (`cinemaName`, `cinemaAddress`, `brandId`)
VALUES
('CGV Vincom Đồng Khởi', 'Tầng 3, TTTM Vincom Center, 72 Lê Thánh Tôn, Quận 1, TP.HCM', 1),
('CGV Landmark 81', 'Tầng B1, TTTM Vincom Center Landmark 81, 772 Điện Biên Phủ, Bình Thạnh, TP.HCM', 1),
('Galaxy Nguyễn Du', '116 Nguyễn Du, Phường Bến Thành, Quận 1, TP.HCM', 2),
('Lotte Cinema Gò Vấp', 'Tầng 3, Lotte Mart, 242 Nguyễn Văn Lượng, Gò Vấp, TP.HCM', 3),
('BHD Star Bitexco', 'Tầng 3 & 4, Tòa nhà Bitexco, 2 Hải Triều, Quận 1, TP.HCM', 4);

INSERT INTO `Screens` (`screenName`, `cinemaId`)
VALUES
('Rạp IMAX 01', 1),
('Rạp Gold Class 02', 1),
('Rạp CineComfort 01', 2),
('Rạp Laser 01', 3),
('Rạp SuperPlex 01', 4),
('Rạp Onyx 01', 5);

INSERT INTO `Seats` (`seatName`, `seatType`, `screenId`)
VALUES
-- Screen 1 (CGV Vincom Đồng Khởi - IMAX 01)
('A01', 'Thuong', 1), ('A02', 'Thuong', 1), ('A03', 'Thuong', 1), ('A04', 'Thuong', 1),
('B01', 'Thuong', 1), ('B02', 'Thuong', 1), ('B03', 'Thuong', 1), ('B04', 'Thuong', 1),
('C01', 'Thuong', 1), ('C02', 'Thuong', 1), ('C03', 'Thuong', 1), ('C04', 'Thuong', 1),
('D01', 'Vip', 1),    ('D02', 'Vip', 1),    ('D03', 'Vip', 1),    ('D04', 'Vip', 1),
('E01', 'Vip', 1),    ('E02', 'Vip', 1),    ('E03', 'Vip', 1),    ('E04', 'Vip', 1),
-- Screen 2 (CGV Vincom Đồng Khởi - Gold Class 02)
('A01', 'Vip', 2),    ('A02', 'Vip', 2),    ('A03', 'Vip', 2),    ('A04', 'Vip', 2),
('B01', 'Vip', 2),    ('B02', 'Vip', 2),    ('B03', 'Vip', 2),    ('B04', 'Vip', 2),
('C01', 'Couple', 2), ('C02', 'Couple', 2), ('C03', 'Couple', 2), ('C04', 'Couple', 2),
-- Screen 3 (CGV Landmark 81 - CineComfort 01)
('A01', 'Thuong', 3), ('A02', 'Thuong', 3), ('A03', 'Thuong', 3), ('A04', 'Thuong', 3),
('B01', 'Thuong', 3), ('B02', 'Thuong', 3), ('B03', 'Thuong', 3), ('B04', 'Thuong', 3),
('C01', 'Vip', 3),    ('C02', 'Vip', 3),    ('C03', 'Vip', 3),    ('C04', 'Vip', 3),
-- Screen 4 (Galaxy Nguyễn Du - Laser 01)
('A01', 'Thuong', 4), ('A02', 'Thuong', 4), ('A03', 'Thuong', 4), ('A04', 'Thuong', 4),
('B01', 'Vip', 4),    ('B02', 'Vip', 4),    ('B03', 'Vip', 4),    ('B04', 'Vip', 4),
-- Screen 5 (Lotte Gò Vấp - SuperPlex 01)
('A01', 'Thuong', 5), ('A02', 'Thuong', 5), ('A03', 'Thuong', 5), ('A04', 'Thuong', 5),
('B01', 'Vip', 5),    ('B02', 'Vip', 5),    ('B03', 'Vip', 5),    ('B04', 'Vip', 5),
-- Screen 6 (BHD Star Bitexco - Onyx 01)
('A01', 'Thuong', 6), ('A02', 'Thuong', 6), ('A03', 'Thuong', 6), ('A04', 'Thuong', 6),
('B01', 'Vip', 6),    ('B02', 'Vip', 6),    ('B03', 'Vip', 6),    ('B04', 'Vip', 6);

-- Mật khẩu mặc định của tất cả tài khoản mẫu là: qweasd
INSERT INTO `Users` (`userFullname`, `userEmail`, `userPhone`, `userPassword`, `userType`)
VALUES
('Nguyễn Thành Đạt', 'd@gmail.com', '0909123456', '$2b$10$8s11cruMqzUSu46ARvSzf.yRpjNv5/BfZM1I9k/Z1c37HG54TTVV6', 'user'),
('Quản Trị Hệ Thống', 'admin@email.com', '0909988776', '$2b$10$8s11cruMqzUSu46ARvSzf.yRpjNv5/BfZM1I9k/Z1c37HG54TTVV6', 'admin'),
('Trần Minh Hoàng', 'hoang.tran@cinepass.vn', '0912345678', '$2b$10$8s11cruMqzUSu46ARvSzf.yRpjNv5/BfZM1I9k/Z1c37HG54TTVV6', 'user'),
('Lê Thu Trang', 'trang.le@cinepass.vn', '0987654321', '$2b$10$8s11cruMqzUSu46ARvSzf.yRpjNv5/BfZM1I9k/Z1c37HG54TTVV6', 'user'),
('Phạm Quốc Bảo', 'bao.pham@cinepass.vn', '0933445566', '$2b$10$8s11cruMqzUSu46ARvSzf.yRpjNv5/BfZM1I9k/Z1c37HG54TTVV6', 'admin');

INSERT INTO `Showtime` (`screenId`, `movieId`, `showTime`, `bookingPrice`)
VALUES
(1, 1, '2026-05-01 18:30:00', 110000),
(1, 1, '2026-05-01 21:15:00', 120000),
(2, 2, '2026-05-02 19:00:00', 150000),
(3, 3, '2026-05-02 20:00:00', 95000),
(4, 4, '2026-05-03 18:00:00', 85000),
(5, 5, '2026-05-03 19:30:00', 90000),
(6, 1, '2026-05-04 20:30:00', 105000);

INSERT INTO `Booking` (`userId`)
VALUES
(1),
(3),
(4);

INSERT INTO `BookingDetail` (`bookingId`, `showId`, `seatId`)
VALUES
(1, 1, 1),
(1, 1, 2),
(2, 3, 21),
(3, 4, 33),
(3, 4, 34);