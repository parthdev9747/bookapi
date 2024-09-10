import { config as conf } from 'dotenv';

conf();

const _config = {
  port: process.env.PORT,
  db: process.env.MONGO_CONNECTION,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  cloudinary_key: process.env.CLOUADINARY_API_KEY,
  cloudinary_secret: process.env.CLOUADINARY_API_SECRET,
  cloudinary_cloud: process.env.CLOUADINARY_CLOUD_NAME,
};

export const config = Object.freeze(_config);
