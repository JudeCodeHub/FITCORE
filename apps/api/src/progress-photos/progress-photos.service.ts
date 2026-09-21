import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma/prisma.service.js';
import type { RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { ALLOWED_PHOTO_CONTENT_TYPES } from './dto/request-upload-url.dto.js';
import type { CreateProgressPhotoDto } from './dto/create-progress-photo.dto.js';

const UPLOAD_URL_TTL_SECONDS = 300;
const VIEW_URL_TTL_SECONDS = 900;

@Injectable()
export class ProgressPhotosService {
  private readonly s3 = new S3Client({ region: process.env.AWS_REGION });
  private readonly bucket = process.env.S3_BUCKET_NAME!;

  constructor(private readonly prisma: PrismaService) {}

  async createUploadUrl(userId: string, contentType: string) {
    const ext =
      ALLOWED_PHOTO_CONTENT_TYPES[
        contentType as keyof typeof ALLOWED_PHOTO_CONTENT_TYPES
      ];
    const key = `progress-photos/${userId}/${randomUUID()}.${ext}`;

    const uploadUrl = await getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: UPLOAD_URL_TTL_SECONDS },
    );

    return { uploadUrl, key };
  }

  async create(userId: string, dto: CreateProgressPhotoDto) {
    if (!dto.key.startsWith(`progress-photos/${userId}/`)) {
      throw new ForbiddenException('Invalid upload key');
    }

    try {
      await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: dto.key }),
      );
    } catch {
      throw new BadRequestException(
        'Upload not found in storage — request a new upload URL and try again',
      );
    }

    const photo = await this.prisma.progressPhoto.create({
      data: {
        userId,
        photoUrl: dto.key,
        note: dto.note,
        takenAt: dto.takenAt ? new Date(dto.takenAt) : undefined,
      },
    });

    return this.withSignedUrl(photo);
  }

  async findAllForUser(userId: string) {
    const photos = await this.prisma.progressPhoto.findMany({
      where: { userId },
      orderBy: { takenAt: 'desc' },
    });
    return Promise.all(photos.map((p) => this.withSignedUrl(p)));
  }

  async findForMember(requester: RequestUser, memberId: string) {
    await this.assertCanView(requester, memberId);
    const photos = await this.prisma.progressPhoto.findMany({
      where: { userId: memberId },
      orderBy: { takenAt: 'desc' },
    });
    return Promise.all(photos.map((p) => this.withSignedUrl(p)));
  }

  async remove(id: string, requester: RequestUser) {
    const photo = await this.prisma.progressPhoto.findUnique({
      where: { id },
    });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }
    if (requester.role !== 'ADMIN' && requester.sub !== photo.userId) {
      throw new ForbiddenException('You can only delete your own photos');
    }

    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: photo.photoUrl }),
    );
    await this.prisma.progressPhoto.delete({ where: { id } });
  }

  private async assertCanView(requester: RequestUser, memberId: string) {
    if (requester.role === 'ADMIN') return;

    if (requester.role === 'TRAINER') {
      const member = await this.prisma.user.findUnique({
        where: { id: memberId },
      });
      if (!member || member.assignedTrainerId !== requester.sub) {
        throw new ForbiddenException(
          'You can only view photos of members assigned to you',
        );
      }
      return;
    }

    throw new ForbiddenException('Not allowed');
  }

  private async withSignedUrl<T extends { photoUrl: string }>(photo: T) {
    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: photo.photoUrl }),
      { expiresIn: VIEW_URL_TTL_SECONDS },
    );
    return { ...photo, url };
  }
}
