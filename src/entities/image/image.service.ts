import * as path from 'path';
import * as sharp from 'sharp';

export class ImageService {
  async saveImage(userId: string, photo: Express.Multer.File): Promise<void> {
    const filePath = path.join('storage', `photo_${userId}.jpg`);
    await this.cutImageAndSave(photo.buffer, filePath);
  }

  getPhotoName(userId: string): string {
    return `photo_${userId}.jpg`;
  }

  private async cutImageAndSave(photo: Buffer, filePatch: string): Promise<void> {
    await sharp(photo)
      .resize(200, 200, {
        fit: sharp.fit.cover,
        position: 'center',
      })
      .jpeg({ mozjpeg: true })
      .toFile(filePatch);
  }
}
