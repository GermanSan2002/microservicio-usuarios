import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CredentialsDTO } from './dto/credentialsDTO';
import { UserDTO } from './dto/userDTO';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post(':idAppClient')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiParam({ name: 'idAppClient', description: 'App id' })
  @ApiBody({ type: CredentialsDTO })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createAccount(
    @Param('idAppClient') idAppClient: string,
    @Body() credentialsDTO: CredentialsDTO,
    @Res() res: Response,
  ) {
    try {
      const userDTO = await this.userService.createUser(credentialsDTO, idAppClient);
      res.status(201).json(userDTO);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Unknown error occurred' });
      }
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UserDTO })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateAccount(
    @Param('id') id: string,
    @Body() userDTO: UserDTO,
    @Res() res: Response,
  ) {
    try {
      const updatedUser = await this.userService.updateUser(id, userDTO);
      res.status(200).json(updatedUser);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Unknown error occurred' });
      }
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteAccount(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.userService.deleteUser(id);
      res.status(204).send();
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Unknown error occurred' });
      }
    }
  }

  @Patch(':id/block')
  @ApiOperation({ summary: 'Block a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ schema: { example: { motivo: 'Reason for blocking' } } })
  @ApiResponse({ status: 200, description: 'User blocked successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async blockAccount(
    @Param('id') id: string,
    @Body('motivo') motivo: string,
    @Res() res: Response,
  ) {
    try {
      const userDTO = await this.userService.blockUser(id, motivo);
      res.status(200).json(userDTO);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Unknown error occurred' });
      }
    }
  }

  @Patch(':id/Active')
  @ApiOperation({ summary: 'Activate a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ schema: { example: { motivo: 'Reason for activate' } } })
  @ApiResponse({ status: 200, description: 'User activeted successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async activeAccount(
    @Param('id') id: string,
    @Body('motivo') motivo: string,
    @Res() res: Response,
  ) {
    try {
      const userDTO = await this.userService.activeUser(id, motivo);
      res.status(200).json(userDTO);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Unknown error occurred' });
      }
    }
  }

  @Post('recover-password')
  @ApiOperation({ summary: 'Recover password' })
  @ApiBody({ schema: { example: { email: 'user@example.com' } } })
  @ApiResponse({ status: 200, description: 'Password recovery email sent' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async changePassword(
    @Body('email') email: string,
    @Res() res: Response,
  ) {
    try {
      await this.userService.recuperarContraseña(email);
      res.status(200).send({ message: 'Password recovery email sent' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Unknown error occurred' });
      }
    }
  }

  @Put(':id/verify')
  @ApiOperation({ summary: 'Verify a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async verifyAccount(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const verify = new UserDTO(
        id,
        null,
        null,
        "verified",
        null,
        null,
        null, 
      );
      const verifiedUser = await this.userService.updateUser(id, verify);
      res.status(200).json(verifiedUser);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Unknown error occurred' });
      }
    }
  }
}
