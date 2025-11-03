import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/User';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { CredentialsDTO } from './dto/credentialsDTO';
import { ConfigService } from '@nestjs/config';
import { Operation } from './entities/Operation';
import { Role } from '../roles/entities/Role';
import { NotFoundException } from '@nestjs/common';
import { Client } from '../client/entities/Client';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let operationRepository: Repository<Operation>;
  let roleRepository: Repository<Role>;
  let clientRepository: Repository<Client>;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Operation),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Client), // Provisión del Client repository
          useClass: Repository,
        },
        {
          provide: AuthService,
          useValue: {
            hashPassword: jest.fn().mockResolvedValue('hashedPassword'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3000'),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    operationRepository = module.get<Repository<Operation>>(getRepositoryToken(Operation));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    clientRepository = module.get<Repository<Client>>(getRepositoryToken(Client)); // Definición de clientRepository
    authService = module.get<AuthService>(AuthService);

    jest.spyOn(roleRepository, 'findByIds').mockResolvedValue([]);
    jest.spyOn(operationRepository, 'create').mockImplementation((operation) => {
      return {
        id: '1',
        tipo: operation.tipo,
        detalles: operation.detalles,
        usuario: operation.usuario,
        fecha: operation.fecha || new Date(),
      } as Operation;
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const credentialsDTO: CredentialsDTO = { email: 'test@example.com', password: 'password' };
      const clientId = 'client-1';
      const client = {
        id: 'client-1',
        name: 'Test Client',
        description: 'Test Client Description',
        users: [],
      } as Client; // Asegurarse de que el objeto tenga todas las propiedades de Client
      const savedUser = {
        id: '1',
        nombre: 'defaultName',
        email: 'test@example.com',
        password: 'hashedPassword',
        estado: 'active',
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
        roles: [],
        appCliente: client,
      };
  
      jest.spyOn(clientRepository, 'findOne').mockResolvedValue(client);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser as User);
  
      const result = await service.createUser(credentialsDTO, clientId);
  
      expect(clientRepository.findOne).toHaveBeenCalledWith({ where: { id: clientId } });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: credentialsDTO.email, appCliente: { id: clientId } },
        relations: ['appCliente'],
      });
      expect(authService.hashPassword).toHaveBeenCalledWith(credentialsDTO.password);
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: savedUser.id,
        nombre: savedUser.nombre,
        email: savedUser.email,
        estado: savedUser.estado,
        fechaCreacion: savedUser.fechaCreacion,
        fechaModificacion: savedUser.fechaModificacion,
        roles: [],
      });
    });

    it('should throw an error if email already exists for the client', async () => {
      const credentialsDTO: CredentialsDTO = { email: 'test@example.com', password: 'password' };
      const clientId = 'client-1';
      const existingUser = { email: 'test@example.com', appCliente: { id: clientId } };

      jest.spyOn(clientRepository, 'findOne').mockResolvedValue({ id: clientId } as Client);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser as User);

      await expect(service.createUser(credentialsDTO, clientId)).rejects.toThrowError('El email ya existe');
    });

    it('should throw an error if client not found', async () => {
      const credentialsDTO: CredentialsDTO = { email: 'test@example.com', password: 'password' };
      const clientId = 'non-existent-client';
    
      // Simula que no se encuentra el cliente
      jest.spyOn(clientRepository, 'findOne').mockResolvedValue(null);
    
      await expect(service.createUser(credentialsDTO, clientId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const userDTO = {
        id: '1',
        nombre: 'updatedName',
        email: 'updated@example.com',
        estado: 'active',
        roles: [],
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
      };
      const existingUser = {
        id: '1',
        nombre: 'defaultName',
        email: 'test@example.com',
        estado: 'active',
        roles: [],
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(existingUser as User);

      const result = await service.updateUser('1', userDTO);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' }, relations: ['roles'] });
      expect(userRepository.save).toHaveBeenCalled();
      expect(result.nombre).toEqual(userDTO.nombre);
      expect(result.email).toEqual(userDTO.email);
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateUser('1', {} as any)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      jest.spyOn(userRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await expect(service.deleteUser('1')).resolves.not.toThrow();
      expect(userRepository.delete).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('blockUser', () => {
    it('should block a user', async () => {
      const existingUser = {
        id: '1',
        nombre: 'defaultName',
        email: 'test@example.com',
        estado: 'active',
        roles: [],
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(existingUser as User);
      jest.spyOn(operationRepository, 'save').mockResolvedValue({
        id: '1',
        tipo: 'block',
        detalles: 'testing block reason',
        usuario: existingUser,
        fecha: new Date(),
      } as Operation);

      const result = await service.blockUser('1', 'testing block reason');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' }, relations: ['roles'] });
      expect(userRepository.save).toHaveBeenCalled();
      expect(operationRepository.save).toHaveBeenCalled();
      expect(result.estado).toEqual('blocked');
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.blockUser('1', 'testing block reason')).rejects.toThrowError(NotFoundException);
    });
  });
});
