import { Controller, Get, Post, Body, Patch, Put, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { UpdatePropertyDto } from './dto/update-property.dto.js';
import { JwtStrategy } from '../auth/guards/jwt.guard.js';

@Controller('api/properties')
export class PropertiesController {
  constructor(propertiesService) {
    this.propertiesService = propertiesService;
  }

  // Create new property
  @Post()
  @UseGuards(JwtStrategy)
  async create(@Request() req, @Body() createPropertyDto) {
    return this.propertiesService.create(req.user.id, createPropertyDto);
  }

  // Get all properties with filters and search
  @Get()
  async findAll(@Query() query) {
    return this.propertiesService.findAll(query);
  }

  // Search properties (alternative endpoint for compatibility)
  @Get('search')
  async searchProperties(@Query() query) {
    return this.propertiesService.findAll(query);
  }

  // Get properties by host  
  @Get('host/:hostId')
  async findByHost(@Param('hostId') hostId, @Query() query) {
    return this.propertiesService.findByHost(hostId, query);
  }

  // Get user's own properties (multiple endpoint compatibility)
  @Get('my-properties')
  @UseGuards(JwtStrategy)
  async getMyProperties(@Request() req, @Query() query) {
    return this.propertiesService.findByHost(req.user.id, query);
  }

  // Get host properties (frontend compatibility)
  @Get('host')
  @UseGuards(JwtStrategy)
  async getHostProperties(@Request() req, @Query() query) {
    return this.propertiesService.findByHost(req.user.id, query);
  }

  // Get user favorites
  @Get('favorites')
  @UseGuards(JwtStrategy)
  async getFavorites(@Request() req, @Query() query) {
    return this.propertiesService.getFavorites(req.user.id, query);
  }

  // Toggle favorite
  @Post(':id/favorite')
  @UseGuards(JwtStrategy)
  async toggleFavorite(@Param('id') id, @Request() req) {
    return this.propertiesService.toggleFavorite(id, req.user.id);
  }

  // Get similar properties
  @Get(':id/similar')
  async getSimilar(@Param('id') id, @Query('limit') limit) {
    return this.propertiesService.getSimilar(id, limit);
  }

  // Get single property
  @Get(':id')
  async findOne(@Param('id') id, @Request() req) {
    const userId = req.user?.id || null;
    return this.propertiesService.findOne(id, userId);
  }

  // Update property (PATCH method)
  @Patch(':id')
  @UseGuards(JwtStrategy)
  async update(@Param('id') id, @Request() req, @Body() updatePropertyDto) {
    return this.propertiesService.update(id, req.user.id, updatePropertyDto);
  }

  // Update property (PUT method for frontend compatibility)
  @Put(':id')
  @UseGuards(JwtStrategy)
  async updateProperty(@Param('id') id, @Request() req, @Body() updatePropertyDto) {
    return this.propertiesService.update(id, req.user.id, updatePropertyDto);
  }

  // Delete property
  @Delete(':id')
  @UseGuards(JwtStrategy)
  async remove(@Param('id') id, @Request() req) {
    return this.propertiesService.remove(id, req.user.id);
  }
}