  import { ApiProperty } from '@nestjs/swagger';
  import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

  export class UserDto {
    @ApiProperty({ format: 'uuid' })
    id!: string;

    @ApiProperty({ format: 'email' })
    email!: string;

    @ApiProperty({ nullable: true })
    displayName!: string | null;

    @ApiProperty()
    loginCount!: number;

    @ApiProperty({ format: 'date-time', nullable: true })
    lastLoginAt!: Date | null;

    @ApiProperty({ format: 'date-time' })
    createdAt!: Date;
  }

  export class SyncUserDto {
    @IsUUID('all')
    oid!: string;

    @IsEmail()
    email!: string;

    @IsOptional()
    @IsString()
    displayName?: string;

    @IsOptional()
    @IsString()
    givenName?: string;

    @IsOptional()
    @IsString()
    familyName?: string;
  }