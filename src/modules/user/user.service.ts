import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { CredentialsDTO } from './dto/credentialsDTO';
import { UserDTO } from './dto/userDTO';
import { Operation } from './entities/Operation';
import { User } from './entities/User';
import { ConfigService } from '@nestjs/config';
import { ErrorManager } from '../../utils/error.manager';
import { RoleDTO } from '../roles/dto/roleDTO';
import { Role } from '../roles/entities/Role';
import { Client } from '../client/entities/Client';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Operation)
    private readonly operationRepository: Repository<Operation>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(credentialsDTO: CredentialsDTO, idAppClient: string): Promise<UserDTO> {
    const { email, password } = credentialsDTO;

    const client = await this.clientRepository.findOne({ where: { id: idAppClient } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${idAppClient} not found`);
    }

    const existingUser = await this.userRepository.findOne({
      where: { email, appCliente: { id: idAppClient } },
      relations: ['appCliente'],
    });

    if (existingUser) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'El email ya existe',
      });
    }

    const hashedPassword = await this.authService.hashPassword(password);
    const user = new User();
    user.nombre = 'defaultName';
    user.email = email;
    user.password = hashedPassword;
    user.estado = 'pending';
    user.roles = []; // Iniciamos con una lista vacía de roles
    user.appCliente = client;
    const savedUser = await this.userRepository.save(user);

    return new UserDTO(
      savedUser.id,
      savedUser.nombre,
      savedUser.email,
      savedUser.estado,
      savedUser.fechaCreacion,
      savedUser.fechaModificacion,
      savedUser.roles.map(role => new RoleDTO(role.id, role.role)), // Convertimos los roles a RoleDTO
    );
  }

  async updateUser(id: string, userDTO: UserDTO): Promise<UserDTO> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'], // Incluimos roles en la consulta
    });
    if (!user) throw new NotFoundException('User not found');

    user.nombre = userDTO.nombre || user.nombre;
    user.email = userDTO.email || user.email;
    user.estado = userDTO.estado || user.estado;
    user.fechaModificacion = new Date();

    // Actualización de roles (si están incluidos en userDTO)
    if (userDTO.roles) {
      const roles = await this.roleRepository.findByIds(userDTO.roles.map(role => role.id));
      user.roles = roles;
    }

    await this.userRepository.save(user);
    return new UserDTO(
      user.id,
      user.nombre,
      user.email,
      user.estado,
      user.fechaCreacion,
      user.fechaModificacion,
      user.roles.map(role => new RoleDTO(role.id, role.role)), // Convertimos los roles a RoleDTO
    );
  }


  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete({ id });
  }

  async blockUser(id: string, motivo: string): Promise<UserDTO> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'], // Incluimos roles en la consulta
    });
    if (!user) throw new NotFoundException('User not found');

    user.estado = 'blocked';
    user.fechaModificacion = new Date();
    await this.userRepository.save(user);

    const operation = this.operationRepository.create({
      usuario: user,
      tipo: 'block',
      detalles: motivo,
      fecha: new Date(),
    });
    await this.operationRepository.save(operation);

    return new UserDTO(
      user.id,
      user.nombre,
      user.email,
      user.estado,
      user.fechaCreacion,
      user.fechaModificacion,
      user.roles.map(role => new RoleDTO(role.id, role.role)), // Convertimos los roles a RoleDTO
    );
  }

  async activeUser(id: string, motivo: string): Promise<UserDTO> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'], // Incluimos roles en la consulta
    });
    if (!user) throw new NotFoundException('User not found');

    user.estado = 'active';
    user.fechaModificacion = new Date();
    await this.userRepository.save(user);

    const operation = this.operationRepository.create({
      usuario: user,
      tipo: 'active',
      detalles: motivo,
      fecha: new Date(),
    });
    await this.operationRepository.save(operation);

    return new UserDTO(
      user.id,
      user.nombre,
      user.email,
      user.estado,
      user.fechaCreacion,
      user.fechaModificacion,
      user.roles.map(role => new RoleDTO(role.id, role.role)),
    );
  }

  async recuperarContraseña(email: string): Promise<void> {
    /* Pendiente */
  }
}
