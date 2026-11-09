import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_NAME,
  UPLOAD_FOLDER,
} from '../../core/constants';

@Injectable()
export class StorageService {
  constructor() {
    cloudinary.config({
      cloud_name: CLOUDINARY_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = UPLOAD_FOLDER,
  ): Promise<UploadApiResponse> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Image file is required');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder }, (error, result) => {
          if (error || !result) {
            const err =
              error instanceof Error
                ? error
                : new Error('Cloudinary upload error');
            return reject(err);
          }
          resolve(result);
        })
        .end(file.buffer);
    });
  }

  async removeFile(publicId: string): Promise<unknown> {
    if (!publicId) {
      return null;
    }
    return cloudinary.uploader.destroy(publicId);
  }
}
