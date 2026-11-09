import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ThemPhimDto {
  @IsString()
  @IsNotEmpty()
  tenPhim: string;

  @IsString()
  @IsOptional()
  trailer?: string;

  @IsString()
  @IsOptional()
  moTa?: string;

  @IsString()
  @IsOptional()
  ngayKhoiChieu?: string;

  @IsOptional()
  danhGia?: number | string;

  @IsOptional()
  hot?: boolean | string;

  @IsOptional()
  dangChieu?: boolean | string;

  @IsOptional()
  sapChieu?: boolean | string;

  @IsString()
  @IsOptional()
  maNhom?: string;

  @IsOptional()
  maPhim?: number | string;
}
