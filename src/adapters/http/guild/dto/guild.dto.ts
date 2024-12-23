import { Guild } from "../../../../domain/entities/guild.entity";
import { IsNotEmpty, IsString } from 'class-validator';
import { Player } from "../../../../domain/entities/player.entity";

export class GuildInputDTO {
  @IsNotEmpty({ message: 'name is required' })
  @IsString({ message: 'name must be a string' })
  name: string;

  constructor(guild: Guild) {
    this.name = guild.name;
  }
}

export class GuildOutputDTO {
  id: string;
  name: string;
  players?: Player[];

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(guild: Guild) {
    this.id = guild.id;
    this.name = guild.name;
    this.players = guild.players;
    this.createdAt = guild.createdAt;
    this.updatedAt = guild.updatedAt;
    this.deletedAt = guild.deletedAt || null;
  }
}