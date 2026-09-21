import { IsIn } from 'class-validator';

export const ALLOWED_PHOTO_CONTENT_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

export class RequestUploadUrlDto {
  @IsIn(Object.keys(ALLOWED_PHOTO_CONTENT_TYPES))
  contentType!: string;
}
