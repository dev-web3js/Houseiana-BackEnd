import { Controller, Post, Delete, Get, Body, Param, UseInterceptors, UploadedFile, UploadedFiles, UseGuards, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service.js';
import { JwtStrategy } from '../auth/guards/jwt.guard.js';

@ApiTags('Upload')
@Controller('api/upload')
export class UploadController {
  constructor(uploadService) {
    this.uploadService = uploadService;
  }

  // Upload single file
  @Post('single')
  @UseGuards(JwtStrategy)
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(@UploadedFile() file, @Body('folder') folder) {
    return this.uploadService.uploadFile(file, folder);
  }

  // Upload multiple files
  @Post('multiple')
  @UseGuards(JwtStrategy)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(@UploadedFiles() files, @Body('folder') folder) {
    return this.uploadService.uploadMultipleFiles(files, folder);
  }

  // Upload property photos
  @Post('property-photos')
  @UseGuards(JwtStrategy)
  @UseInterceptors(FilesInterceptor('photos', 20))
  async uploadPropertyPhotos(@UploadedFiles() files) {
    return this.uploadService.uploadMultipleFiles(files, 'properties');
  }

  // Upload profile image
  @Post('profile-image')
  @UseGuards(JwtStrategy)
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(@UploadedFile() file) {
    return this.uploadService.uploadFile(file, 'profiles');
  }

  // Upload documents (KYC, etc.)
  @Post('documents')
  @UseGuards(JwtStrategy)
  @UseInterceptors(FilesInterceptor('documents', 5))
  async uploadDocuments(@UploadedFiles() files) {
    return this.uploadService.uploadMultipleFiles(files, 'documents');
  }

  // Generate presigned URL for client-side upload
  @Post('presigned-url')
  @UseGuards(JwtStrategy)
  async generateUploadUrl(
    @Body('fileName') fileName,
    @Body('contentType') contentType,
    @Body('folder') folder,
  ) {
    return this.uploadService.generateUploadUrl(fileName, contentType, folder);
  }

  // Delete single file
  @Delete('file/:key')
  @UseGuards(JwtStrategy)
  async deleteFile(@Param('key') key) {
    return this.uploadService.deleteFile(decodeURIComponent(key));
  }

  // Delete multiple files
  @Delete('files')
  @UseGuards(JwtStrategy)
  async deleteMultipleFiles(@Body('fileKeys') fileKeys) {
    return this.uploadService.deleteMultipleFiles(fileKeys);
  }

  // Get file metadata
  @Get('metadata/:key')
  @UseGuards(JwtStrategy)
  async getFileMetadata(@Param('key') key) {
    return this.uploadService.getFileMetadata(decodeURIComponent(key));
  }

  // Generate presigned URL for file access
  @Get('presigned-access/:key')
  @UseGuards(JwtStrategy)
  async generatePresignedUrl(@Param('key') key, @Query('expires') expires) {
    const expiresIn = expires ? parseInt(expires) : 3600;
    return this.uploadService.generatePresignedUrl(decodeURIComponent(key), expiresIn);
  }
}