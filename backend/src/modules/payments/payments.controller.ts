import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async findAll() {
    return { message: 'Get all payments - to be implemented' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { message: 'Get payment by ID - to be implemented' };
  }

  @Post()
  async create(@Body() createPaymentDto: any) {
    return { message: 'Create payment - to be implemented' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePaymentDto: any) {
    return { message: 'Update payment - to be implemented' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return { message: 'Delete payment - to be implemented' };
  }
} 