import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientDTO } from './dto/clientDTO';
import { Client } from './entities/Client';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(clientDTO: ClientDTO): Promise<Client> {
    const client = this.clientRepository.create(clientDTO);
    return await this.clientRepository.save(client);
  }

  async update(clientDTO: ClientDTO): Promise<Client> {
    const client = await this.clientRepository.findOneBy({ id: clientDTO.id });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    Object.assign(client, clientDTO);
    return await this.clientRepository.save(client);
  }

  async delete(id: string): Promise<void> {
    const result = await this.clientRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
  }
}
