// src/modules/roles/role.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './roles.services';
import { RoleDTO } from './dto/roleDTO';
import { NotFoundException } from '@nestjs/common';

describe('RoleController', () => {
  let controller: RoleController;
  let service: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: {
            setUsers: jest.fn(),
            createRole: jest.fn(),
            deleteRole: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
    service = module.get<RoleService>(RoleService);
  });

  describe('setUsers', () => {
    it('should call roleService.setUsers with the correct parameters', async () => {
      const roleId = '1';
      const usersId = ['user1', 'user2'];
      const response = { message: 'Role assigned successfully', users: [] };

      jest.spyOn(service, 'setUsers').mockResolvedValue(response);

      const result = await controller.setUsers(roleId, usersId);
      expect(service.setUsers).toHaveBeenCalledWith(roleId, usersId);
      expect(result).toEqual(response);
    });

    it('should throw NotFoundException if roleService.setUsers throws', async () => {
      const roleId = '1';
      const usersId = ['user1'];

      jest.spyOn(service, 'setUsers').mockRejectedValue(new NotFoundException());

      await expect(controller.setUsers(roleId, usersId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createRole', () => {
    it('should call roleService.createRole with the correct parameters', async () => {
      const roleDTO: RoleDTO = { id: '1', role: 'Admin' };
      const response = { id: '1', role: 'Admin' };

      jest.spyOn(service, 'createRole').mockResolvedValue(response);

      const result = await controller.createRole(roleDTO);
      expect(service.createRole).toHaveBeenCalledWith(roleDTO);
      expect(result).toEqual(response);
    });

    it('should handle errors thrown by roleService.createRole', async () => {
      const roleDTO: RoleDTO = { id: '1', role: 'Admin' };

      jest.spyOn(service, 'createRole').mockRejectedValue(new Error('Invalid data'));

      await expect(controller.createRole(roleDTO)).rejects.toThrow('Invalid data');
    });
  });

  describe('deleteRole', () => {
    it('should call roleService.deleteRole with the correct ID', async () => {
      const roleId = '1';

      jest.spyOn(service, 'deleteRole').mockResolvedValue({ affected: 1 });

      const result = await controller.deleteRole(roleId);
      expect(service.deleteRole).toHaveBeenCalledWith(roleId);
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw NotFoundException if roleService.deleteRole throws', async () => {
      const roleId = '1';

      jest.spyOn(service, 'deleteRole').mockRejectedValue(new NotFoundException());

      await expect(controller.deleteRole(roleId)).rejects.toThrow(NotFoundException);
    });
  });
});
