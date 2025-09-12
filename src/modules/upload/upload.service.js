import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  constructor(configService) {
    this.configService = configService;
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION', 'us-east-1'),
    });
    this.bucketName = this.configService.get('AWS_S3_BUCKET', 'houseiana-uploads');
  }

  // Upload single file to S3
  async uploadFile(file, folder = 'general') {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large (max 10MB)');
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    try {
      const uploadResult = await this.s3.upload({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }).promise();

      return {
        url: uploadResult.Location,
        key: uploadResult.Key,
        bucket: uploadResult.Bucket,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, folder = 'general') {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 files allowed');
    }

    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    
    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new BadRequestException(`Failed to upload files: ${error.message}`);
    }
  }

  // Delete file from S3
  async deleteFile(fileKey) {
    try {
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: fileKey,
      }).promise();

      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  // Delete multiple files
  async deleteMultipleFiles(fileKeys) {
    if (!fileKeys || fileKeys.length === 0) {
      throw new BadRequestException('No file keys provided');
    }

    try {
      const deleteObjects = fileKeys.map(key => ({ Key: key }));
      
      await this.s3.deleteObjects({
        Bucket: this.bucketName,
        Delete: {
          Objects: deleteObjects,
        },
      }).promise();

      return { message: 'Files deleted successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to delete files: ${error.message}`);
    }
  }

  // Generate presigned URL for temporary access
  async generatePresignedUrl(fileKey, expiresIn = 3600) {
    try {
      const url = this.s3.getSignedUrl('getObject', {
        Bucket: this.bucketName,
        Key: fileKey,
        Expires: expiresIn, // URL expires in 1 hour by default
      });

      return { url, expiresIn };
    } catch (error) {
      throw new BadRequestException(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  // Generate presigned URL for upload (client-side upload)
  async generateUploadUrl(fileName, contentType, folder = 'general') {
    const fileKey = `${folder}/${uuidv4()}-${fileName}`;

    try {
      const url = this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: fileKey,
        ContentType: contentType,
        Expires: 3600, // URL expires in 1 hour
        ACL: 'public-read',
      });

      return { 
        uploadUrl: url, 
        fileKey,
        publicUrl: `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to generate upload URL: ${error.message}`);
    }
  }

  // Resize and optimize image (requires sharp library)
  async optimizeImage(file, options = {}) {
    const sharp = require('sharp');
    const { width = 1200, height = 800, quality = 80 } = options;

    try {
      const optimizedBuffer = await sharp(file.buffer)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality, progressive: true })
        .toBuffer();

      return {
        ...file,
        buffer: optimizedBuffer,
        size: optimizedBuffer.length,
        mimetype: 'image/jpeg',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to optimize image: ${error.message}`);
    }
  }

  // Get file metadata
  async getFileMetadata(fileKey) {
    try {
      const result = await this.s3.headObject({
        Bucket: this.bucketName,
        Key: fileKey,
      }).promise();

      return {
        key: fileKey,
        size: result.ContentLength,
        contentType: result.ContentType,
        lastModified: result.LastModified,
        etag: result.ETag,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get file metadata: ${error.message}`);
    }
  }
}