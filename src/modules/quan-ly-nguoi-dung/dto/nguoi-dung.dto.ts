import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DangNhapDto {
  @IsString()
  @IsNotEmpty()
  taiKhoan: string;

  @IsString()
  @IsNotEmpty()
  matKhau: string;
}

export class DangKyDto {
  @IsString()
  @IsNotEmpty()
  taiKhoan: string;

  @IsString()
  @IsNotEmpty()
  matKhau: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  soDt?: string;

  @IsString()
  @IsOptional()
  maNhom?: string;

  @IsString()
  @IsNotEmpty()
  hoTen: string;
}

export class ThemNguoiDungDto extends DangKyDto {
  @IsString()
  @IsOptional()
  maLoaiNguoiDung?: string;
}

export class CapNhatNguoiDungDto extends ThemNguoiDungDto {}
