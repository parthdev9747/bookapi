import cloudinary from '../config/cloudinary';
import fs from 'node:fs';

const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
  resourceType: string = 'auto',
) => {
  const mimeType = file.mimetype.split('/').at(-1);
  const fileName = file.filename.split('.')[0];
  const filePath = file.path;

  const uploadResult = await cloudinary.uploader.upload(filePath, {
    public_id: fileName,
    folder: folder,
    format: mimeType,
    resource_type: resourceType as 'auto' | 'image' | 'video' | 'raw',
  });

  await fs.promises.unlink(filePath);

  return uploadResult;
};

export { uploadToCloudinary };
