  import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    NotFoundException,
    Post,   
  } from '@nestjs/common';
  import { ApiOAuth2, ApiTags, ApiOperation } from '@nestjs/swagger';
  import { UsersService } from './users.service.js';
  import { CurrentUser } from '@/common/decorators/current-user.decorator.js';
  import type { EntraJwtPayload } from '@/auth/types/entra-jwt-payload.js';
  import { UserDto, SyncUserDto } from './dto/user.dto.js';

  @ApiTags('users')
  @ApiOAuth2([])
  @Controller()
  export class UsersController {
    constructor(private users: UsersService) {}

    @Get('me')
    @ApiOperation({ summary: 'Get the current authenticated user' })
    async me(@CurrentUser() jwt: EntraJwtPayload): Promise<UserDto> {
      const user = await this.users.findById(jwt.oid);
      if (!user) throw new NotFoundException('User not found. Call POST /users/sync first.');
      return { 
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        loginCount: user.loginCount,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      };
    }

    @Post('users/sync')
    @ApiOperation({ summary: 'Upsert the local user from Entra claims' })
    async sync(
      @CurrentUser() jwt: EntraJwtPayload,
      @Body() body: SyncUserDto,
    ): Promise<UserDto> {
      if (body.oid !== jwt.oid) {
        throw new ForbiddenException('oid mismatch between token and body');
      }
  
      const emailFromToken =
        jwt.email ?? (Array.isArray(jwt.emails) ? jwt.emails[0] : undefined);
      const email = emailFromToken ?? body.email;

      const user = await this.users.syncFromEntra({
        oid: jwt.oid,
        email,
        displayName: body.displayName ?? jwt.name,
        givenName: body.givenName ?? jwt.given_name,
        familyName: body.familyName ?? jwt.family_name,
      });
  
      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        loginCount: user.loginCount,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      };
    }
  }