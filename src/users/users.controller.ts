import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Patch, Post, UseGuards, Req, Delete } from '@nestjs/common';
import { User } from './schema/user.schema';
import { UsersService } from './users.service';
import { InjectRolesBuilder, RolesBuilder } from 'nest-access-control';

import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Users') /* Swagger * */
@Controller('users')
export class UsersController {

  constructor(
    private readonly userService: UsersService,
    @InjectRolesBuilder() private readonly rolesBuilder: RolesBuilder
  ) { }

  public readonly resource = 'users';

  // swagger //
  @ApiOperation({ summary: 'Get all Users. By default can be done only by ADMIN' })
  // ----- //
  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Req() req: any
  ): Promise<User[]> {
    return this.userService.getAll(null, null, null, {
      permission: this.rolesBuilder.can(req.user.roles),
      userId: req.user.id,
      resource: this.resource
    });
  }

  // swagger //
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'Get a User by id' })
  // ----- //
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(
    @Req() req: any,
    @Param('id') id: string): Promise<User> {
    return this.userService.get({ _id: id }, null, null, {
      permission: this.rolesBuilder.can(req.user.roles),
      userId: req.user.id,
      ownershipField: '_id',
      resource: this.resource
    })
  }

  // swagger //
  @ApiOperation({ summary: 'Create a new User' })
  // ----- //
  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req,
    @Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto, {
      permission: this.rolesBuilder.can(req.user.roles),
      resource: this.resource,
      userId: req.user.id
    });
  }

  // swagger //
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'Change a User by id' })
  // ----- //
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateUserDto: any): Promise<User> {
    return this.userService.update(id, updateUserDto, { new: true }, {
      permission: this.rolesBuilder.can(req.user.roles),
      resource: this.resource,
      userId: req.user.id,
      ownershipField: '_id'
    });
  }

  // swagger //
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'Delete a User by id' })
  // ----- //
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(
    @Req() req: any,
    @Param('id') _id: string): Promise<void> {
    return this.userService.deactivateOne({ _id }, {
      permission: this.rolesBuilder.can(req.user.roles),
      resource: this.resource,
      userId: req.user.id,
      ownershipField: '_id'
    });
  }
}
