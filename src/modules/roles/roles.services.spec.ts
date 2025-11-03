// src/modules/roles/role.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './roles.services';
import { Role } from './entities/Role';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/User';
import { NotFoundException } from '@nestjs/common';
import { RoleDTO } from './dto/roleDTO';

describe('RoleService', () => {
  let service: RoleService;
  let roleRepository: Repository<Role>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('setUsers', () => {
    it('should assign a role to the specified users', async () => {
      const roleId = '1';
      const usersId = ['1', '2'];

      const role = new Role();
      role.id = roleId;

      const user1: User = {
        id: '1',
        nombre: 'Test User 1',
        email: 'test1@example.com',
        password: 'password',
        estado: 'active',
        roles: [],
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
        appCliente: null, // Agrega el valor apropiado, puede ser null o un objeto Client simulado
        operations: [], // Agrega una lista vacía o un arreglo de operaciones simuladas si es necesario
      };
      
      const user2: User = {
        id: '2',
        nombre: 'Test User 2',
        email: 'test2@example.com',
        password: 'password',
        estado: 'active',
        roles: [],
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
        appCliente: null, // Agrega el valor apropiado
        operations: [], // Agrega una lista vacía o simulaciones de operaciones
      };      

      jest.spyOn(roleRepository, 'findOneBy').mockResolvedValue(role);
      jest.spyOn(userRepository, 'find').mockResolvedValue([user1, user2]);
      jest.spyOn(userRepository, 'save').mockResolvedValue([user1, user2] as any);

      const result = await service.setUsers(roleId, usersId);

      expect(result.message).toEqual(`Role with ID ${roleId} successfully assigned to users`);
      expect(result.users).toHaveLength(2);
    });

    it('should throw NotFoundException if role is not found', async () => {
      jest.spyOn(roleRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.setUsers('1', ['1'])).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if any user is not found', async () => {
      const role = new Role();
      role.id = '1';

      jest.spyOn(roleRepository, 'findOneBy').mockResolvedValue(role);
      jest.spyOn(userRepository, 'find').mockResolvedValue([{ id: '1', roles: [] } as User]);

      await expect(service.setUsers('1', ['1', '2'])).rejects.toThrow(NotFoundException);
    });
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const roleDTO: RoleDTO = { id: '1', role: 'Admin' }; // Sin 'users'
      jest.spyOn(roleRepository, 'save').mockResolvedValue(roleDTO as Role);
  
      const result = await service.createRole(roleDTO);
      expect(result).toEqual(roleDTO);
    });
  });  

  describe('update', () => {
    it('should update an existing role', async () => {
      const roleDTO: RoleDTO = { id: '1', role: 'Admin' };
      const role = new Role();
      role.id = roleDTO.id;
      role.role = 'User';

      jest.spyOn(roleRepository, 'findOneBy').mockResolvedValue(role);
      jest.spyOn(roleRepository, 'save').mockResolvedValue({ ...role, role: roleDTO.role });

      const result = await service.update(roleDTO);
      expect(result.role).toEqual(roleDTO.role);
    });

    it('should throw NotFoundException if role is not found', async () => {
      jest.spyOn(roleRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.update({ id: '1', role: 'Admin' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteRole', () => {
    it('should delete a role by ID', async () => {
      jest.spyOn(roleRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteRole('1');
      expect(result).toEqual({ affected: 1 });
    });

    it('should return an error if no role is deleted', async () => {
      jest.spyOn(roleRepository, 'delete').mockResolvedValue({ affected: 0 } as any);

      const result = await service.deleteRole('1');
      expect(result).toEqual({ affected: 0 });
    });
  });
});
