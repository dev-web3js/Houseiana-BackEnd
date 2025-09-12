import { IsString, IsNumber, IsDateString, IsOptional, Min, Max } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  listingId;

  @IsDateString()
  checkIn;

  @IsDateString()
  checkOut;

  @IsNumber()
  @Min(1)
  @Max(20)
  adults;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  children;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  infants;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(3)
  pets;

  @IsOptional()
  @IsString()
  guestMessage;

  @IsOptional()
  @IsString()
  specialRequests;

  @IsOptional()
  @IsString()
  arrivalTime;

  @IsOptional()
  @IsString()
  guestPhone;

  @IsOptional()
  @IsString()
  guestEmail;
}