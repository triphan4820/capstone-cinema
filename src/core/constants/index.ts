import 'dotenv/config';

export const PORT = Number(process.env.PORT) || 3000;
export const DATABASE_URL = process.env.DATABASE_URL || '';

export const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || 'access-secret-default-key';
export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-default-key';

export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME || '';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

export const UPLOAD_FOLDER = 'cinema/banners';
