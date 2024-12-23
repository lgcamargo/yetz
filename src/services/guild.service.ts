import { Guild, Prisma } from '@prisma/client';
import { GuildInputDTO } from '../adapters/http/guild/dto/guild.dto';
import { GuildRepository } from '../repositories/guild.repository';

export class GuildService {
  private guildRepository: GuildRepository;

  constructor(guildRepository: GuildRepository) {
    this.guildRepository = guildRepository;
  }

  async getGuildById(id: string) {
    return await this.guildRepository.getGuildById(id);
  }

  async getAllGuilds() {
    return await this.guildRepository.getAllGuilds();
  }

  async createGuild(guild: GuildInputDTO): Promise<Guild> {
    const alreadyExists = await this.guildRepository.getGuildByName(guild.name);
    if (alreadyExists) {
      throw new Error(`Guild with name ${guild.name} already exists`);
    }
    const guildData: Prisma.GuildCreateInput = {
      name: guild.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.guildRepository.createGuild(guildData);
  }

  async updateGuild(id: string, guild: GuildInputDTO) {
    const alreadyExists = await this.guildRepository.getGuildByName(guild.name);
    if (alreadyExists) {
      throw new Error(`Guild with name ${guild.name} already exists`);
    }
    const guildData: Prisma.GuildUpdateInput = {
      name: guild.name,
      updatedAt: new Date(),
    };
    return await this.guildRepository.updateGuild(id, guildData);
  }

  async deleteGuild(id: string) {
    return await this.guildRepository.deleteGuild(id);
  }
}