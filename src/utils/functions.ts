import cloudinary from '../config/cloudinary';

const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
  resourceType: string = 'auto',
) => {
  const mimeType = file.mimetype.split('/').at(-1);
  const fileName = file.filename;
  const filePath = file.path;

  return await cloudinary.uploader.upload(filePath, {
    public_id: fileName,
    folder: folder,
    format: mimeType,
    resource_type: resourceType as 'auto' | 'image' | 'video' | 'raw',
  });
};

export { uploadToCloudinary };
