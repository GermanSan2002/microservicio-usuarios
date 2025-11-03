import { Controller, Post, Delete, Body, Param, Put } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientDTO } from './dto/clientDTO';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('clients')
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiBody({ type: ClientDTO })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createClient(@Body() clientDTO: ClientDTO) {
    return await this.clientService.create(clientDTO);
  }

  @Put()
  @ApiOperation({ summary: 'Update an existing client' })
  @ApiBody({ type: ClientDTO })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async updateClient(@Body() clientDTO: ClientDTO) {
    return await this.clientService.update(clientDTO);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client by ID' })
  @ApiParam({ name: 'id', description: 'ID of the client to delete' })
  @ApiResponse({ status: 204, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async deleteClient(@Param('id') id: string) {
    return await this.clientService.delete(id);
  }
}
