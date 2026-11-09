import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { RolesGuard } from './core/guards/roles.guard';
import { QuanLyDatVeModule } from './modules/quan-ly-dat-ve/quan-ly-dat-ve.module';
import { QuanLyNguoiDungModule } from './modules/quan-ly-nguoi-dung/quan-ly-nguoi-dung.module';
import { QuanLyPhimModule } from './modules/quan-ly-phim/quan-ly-phim.module';
import { QuanLyRapModule } from './modules/quan-ly-rap/quan-ly-rap.module';
import { PrismaModule } from './shared/database/prisma.module';
import { JwtTokenModule } from './shared/jwt/jwt-token.module';
import { StorageModule } from './shared/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    JwtTokenModule,
    StorageModule,
    QuanLyNguoiDungModule,
    QuanLyPhimModule,
    QuanLyRapModule,
    QuanLyDatVeModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
