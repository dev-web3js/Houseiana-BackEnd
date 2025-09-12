import { IsOptional } from 'class-validator';
import { CreatePropertyDto } from './create-property.dto.js';

export class UpdatePropertyDto {
  @IsOptional()
  title;

  @IsOptional()
  description;

  @IsOptional()
  propertyType;

  @IsOptional()
  city;

  @IsOptional()
  area;

  @IsOptional()
  district;

  @IsOptional()
  bedrooms;

  @IsOptional()
  bathrooms;

  @IsOptional()
  beds;

  @IsOptional()
  maxGuests;

  @IsOptional()
  monthlyPrice;

  @IsOptional()
  cleaningFee;

  @IsOptional()
  securityDeposit;

  @IsOptional()
  minNights;

  @IsOptional()
  maxNights;

  @IsOptional()
  instantBook;

  @IsOptional()
  checkInTime;

  @IsOptional()
  checkOutTime;

  @IsOptional()
  photos;

  @IsOptional()
  houseRules;

  @IsOptional()
  checkInInstructions;

  @IsOptional()
  coordinates;

  @IsOptional()
  inUnitFeatures;

  @IsOptional()
  buildingFacilities;

  @IsOptional()
  compoundAmenities;

  @IsOptional()
  safetyFeatures;

  @IsOptional()
  isActive;

  @IsOptional()
  status;
}