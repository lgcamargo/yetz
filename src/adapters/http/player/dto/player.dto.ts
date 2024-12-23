import 'reflect-metadata';
import { Player } from "../../../../domain/entities/player.entity";
import { IsNotEmpty, IsString, IsInt, IsOptional, Min, Max, IsDateString, IsEnum } from 'class-validator';

export class PlayerInputDTO {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Class is required' })
  @IsString({ message: 'Class must be a string' })
  @IsEnum(['WARRIOR', 'MAGE', 'CLERIC'], { message: 'Class must be either warrior, mage, or CLERIC' })
  class: string;

  @IsInt({ message: 'Experience must be an integer' })
  @Min(0, { message: 'Experience cannot be negative' })
  @Max(100, { message: 'Experience cannot be over 100' })
  experience: number;

  @IsOptional()
  @IsString({ message: 'Guild ID must be a string if provided' })
  guildId?: string;

  constructor(data: Partial<PlayerInputDTO>) {
    this.name = data.name || "";
    this.class = data.class || "";
    this.experience = data.experience || 0;
    this.guildId = data.guildId;
  }
}

export class PlayerOutputDTO {
  id: string;
  name: string;
  class: string;
  experience: number;
  guildId: string | null;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(player: Player) {
    this.id = player.id;
    this.name = player.name;
    this.class = player.class;
    this.experience = player.experience;
    this.guildId = player.guildId || null;
    this.createdAt = player.createdAt;
    this.updatedAt = player.updatedAt;
    this.deletedAt = player.deletedAt || null;
  }
}