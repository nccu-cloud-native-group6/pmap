import {
  IsString,
  validate,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';
import { extractErrors } from '../../../../../Errors/errors.js';
import logger from '../../../../../Logger/index.js';

export const validatePostReportReqBody = async (
  body: Record<string, unknown>,
): Promise<string[]> => {
  const dto = plainToInstance(PostReportDto, body);
  const errors = await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties: false,
  });

  logger.info(`Validation Errors: ${JSON.stringify(errors, null, 2)}`);

  if (errors.length > 0) {
    return extractErrors(errors);
  }
  return [];
};

export class lntlatDto {
  @IsNotEmpty()
  @IsNumber()
  lng!: number;

  @IsNotEmpty()
  @IsNumber()
  lat!: number;
}

export class LocationDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => lntlatDto)
  latlng!: lntlatDto;

  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsNotEmpty()
  @IsNumber()
  polygonId!: number;
}

export class PostReportDto {
  @IsNotEmpty()
  @IsString()
  comment!: string;

  @IsNotEmpty()
  @IsNumber()
  rainDegree!: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;
}
