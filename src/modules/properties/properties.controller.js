import { Controller, Get, Post, Body, Patch, Put, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { UpdatePropertyDto } from './dto/update-property.dto.js';
import { JwtStrategy } from '../auth/guards/jwt.guard.js';

@ApiTags('Properties')
@Controller('api/properties')
export class PropertiesController {
  constructor(propertiesService) {
    this.propertiesService = propertiesService;
  }

  @Post()
  @UseGuards(JwtStrategy)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create new property',
    description: 'Create a new property listing. Only authenticated hosts can create properties.'
  })
  @ApiResponse({
    status: 201,
    description: 'Property created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clp1234567890' },
        title: { type: 'string', example: 'Luxury Apartment in Manhattan' },
        propertyType: { type: 'string', example: 'apartment' },
        city: { type: 'string', example: 'New York' },
        monthlyPrice: { type: 'number', example: 3500 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() createPropertyDto) {
    return this.propertiesService.create(req.user.id, createPropertyDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all properties',
    description: 'Retrieve properties with optional filters and search. Supports pagination.'
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search query for property title/description' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
  @ApiQuery({ name: 'propertyType', required: false, description: 'Filter by property type' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum price filter' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum price filter' })
  @ApiQuery({ name: 'bedrooms', required: false, description: 'Number of bedrooms' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              city: { type: 'string' },
              monthlyPrice: { type: 'number' },
              photos: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            pages: { type: 'number' }
          }
        }
      }
    }
  })
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