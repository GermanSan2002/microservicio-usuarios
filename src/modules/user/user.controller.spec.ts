import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CredentialsDTO } from './dto/credentialsDTO';
import { UserDTO } from './dto/userDTO';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';

const mockUserService = {
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  blockUser: jest.fn(),
  recuperarContraseña: jest.fn(),
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  return res as Response;
};

const testUserDTO = new UserDTO('1', 'John Doe', 'test@example.com', 'active', new Date(), new Date(), []);










describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAccount', () => {
    it('should create a new user', async () => {
      const res = mockResponse();
      const credentialsDTO: CredentialsDTO = { email: 'test@example.com', password: 'password' };
      const idAppClient = 'client-123'; // Añade el argumento que falta
      mockUserService.createUser.mockResolvedValue(testUserDTO);
  
      await controller.createAccount(idAppClient, credentialsDTO, res); // Asegúrate de pasar todos los argumentos requeridos
  
      expect(userService.createUser).toHaveBeenCalledWith(credentialsDTO, idAppClient);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(testUserDTO);
    });
  });  

  describe('updateAccount', () => {
    it('should update an existing user', async () => {
      const res = mockResponse();
      const userDTO: UserDTO = { ...testUserDTO, nombre: 'Jane Doe' };
      mockUserService.updateUser.mockResolvedValue(userDTO);

      await controller.updateAccount('1', userDTO, res);

      expect(userService.updateUser).toHaveBeenCalledWith('1', userDTO);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(userDTO);
    });
  });

  describe('deleteAccount', () => {
    it('should delete a user', async () => {
      const res = mockResponse();

      await controller.deleteAccount('1', res);

      expect(userService.deleteUser).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('blockAccount', () => {
    it('should block a user', async () => {
      const res = mockResponse();
      const motivo = 'Violation of terms';
      mockUserService.blockUser.mockResolvedValue(testUserDTO);

      await controller.blockAccount('1', motivo, res);

      expect(userService.blockUser).toHaveBeenCalledWith('1', motivo);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(testUserDTO);
    });
  });

  describe('changePassword', () => {
    it('should initiate password recovery', async () => {
      const res = mockResponse();
      const email = 'test@example.com';

      await controller.changePassword(email, res);

      expect(userService.recuperarContraseña).toHaveBeenCalledWith(email);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: 'Password recovery email sent' });
    });
  });
});