import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service.js';

@Controller('api/search')
export class SearchController {
  constructor(searchService) {
    this.searchService = searchService;
  }

  // Global search endpoint
  @Get()
  async globalSearch(@Query() query) {
    return this.searchService.globalSearch({}, query);
  }

  // Property-specific search with advanced filters
  @Get('properties')
  async searchProperties(@Query() query) {
    return this.searchService.searchProperties(query);
  }

  // Get search suggestions/autocomplete
  @Get('suggestions')
  async getSearchSuggestions(@Query() query) {
    return this.searchService.getSearchSuggestions(query);
  }
}