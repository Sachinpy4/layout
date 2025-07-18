import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StallsService } from './stalls.service';

@ApiTags('stalls')
@Controller('stalls')
export class StallsController {
  constructor(private readonly stallsService: StallsService) {}

  @Get()
  async findAll() {
    return { message: 'Get all stalls - to be implemented' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { message: 'Get stall by ID - to be implemented' };
  }

  @Post()
  async create(@Body() createStallDto: any) {
    return { message: 'Create stall - to be implemented' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateStallDto: any) {
    return { message: 'Update stall - to be implemented' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return { message: 'Delete stall - to be implemented' };
  }
} 