import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class VeItemDto {
  @IsInt()
  @IsNotEmpty()
  maGhe: number;

  @IsNumber()
  @IsNotEmpty()
  giaVe: number;
}

export class DanhSachVeDatDto {
  @IsInt()
  @IsNotEmpty()
  maLichChieu: number;

  @IsArray()
  @ArrayNotEmpty()
  danhSachVe: VeItemDto[];
}

export class TaoLichChieuDto {
  @IsInt()
  @IsNotEmpty()
  maPhim: number;

  @IsString()
  @IsNotEmpty()
  ngayChieuGioChieu: string;

  @IsNotEmpty()
  maRap: string | number;

  @IsNumber()
  @IsNotEmpty()
  giaVe: number;
}
