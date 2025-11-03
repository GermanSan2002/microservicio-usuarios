import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClientDTO {
  @ApiPropertyOptional({
    example: '1',
    description: 'The unique identifier of the client',
  })
  id?: string;

  @ApiProperty({
    example: 'Test Client',
    description: 'The name of the client',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'This is a test client for demonstration purposes.',
    description: 'A brief description of the client',
  })
  description?: string;
}
