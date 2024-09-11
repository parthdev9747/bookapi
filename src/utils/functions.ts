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

const deleteFromCloudinary = async (fileName: string, resourceType: string = 'auto') => {
  if (fileName) {
    const spiltFile = fileName.split('/');
    let cloudinaryFileName = '';
    if (resourceType === 'raw') {
      cloudinaryFileName = spiltFile.at(-2) + '/' + spiltFile.at(-1);
    } else {
      cloudinaryFileName = spiltFile.at(-2) + '/' + spiltFile.at(-1)?.split('.').at(-2);
    }

    await cloudinary.uploader.destroy(cloudinaryFileName, {
      resource_type: resourceType as 'auto' | 'image' | 'video' | 'raw',
    });
  }
};

export { uploadToCloudinary, deleteFromCloudinary };
