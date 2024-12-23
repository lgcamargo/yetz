import { Player, Prisma } from '@prisma/client';
import { PlayerInputDTO} from '../adapters/http/player/dto/player.dto';
import { PlayerRepository } from '../repositories/player.repository';
import { GuildRepository } from '../repositories/guild.repository';

export class PlayerService {
  private playerRepository: PlayerRepository;
  private guildRepository: GuildRepository;

  constructor(playerRepository: PlayerRepository, guildRepository: GuildRepository) {
    this.playerRepository = playerRepository;
    this.guildRepository = guildRepository;
  }

  async getPlayerById(id: string) {
    return await this.playerRepository.getPlayerById(id);
  }

  async getAllPlayers() {
    return await this.playerRepository.getAllPlayers();
  }
  async createPlayer(player: PlayerInputDTO): Promise<Player> {
    const alreadyExists = await this.playerRepository.getPlayerByName(player.name);
    if (alreadyExists) {
      throw new Error(`Player with name ${player.name} already exists`);
    }
    const playerData: Prisma.PlayerCreateInput = {
      name: player.name,
      class: player.class,
      experience: player.experience,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (player.guildId) {
      playerData.guild = {
        connect: {
          id: player.guildId,
        },
      };
    }

    return await this.playerRepository.createPlayer(playerData);
  }
  async updatePlayer(id: string, player: PlayerInputDTO) {
    const alreadyExists = await this.playerRepository.getPlayerByName(player.name);
    if (alreadyExists) {
      throw new Error(`Player with name ${player.name} already exists`);
    }
    const playerData: Prisma.PlayerUpdateInput = {
      name: player.name,
      class: player.class,
      experience: player.experience,
      updatedAt: new Date(),
    };

    if (player.guildId) {
      playerData.guild = {
        connect: {
          id: player.guildId,
        },
      };
    }
    
    return await this.playerRepository.updatePlayer(id, playerData);
  }

  async deletePlayer(id: string) {
    return await this.playerRepository.deletePlayer(id);
  }

  async balancedPlayer(playerId: string) {
    const player = await this.playerRepository.getPlayerById(playerId);
    if (!player) {
      throw new Error(`Player with id ${playerId} not found`);
    }

    const guilds = await this.guildRepository.getAllGuilds()
    if (guilds.length === 0) {
      throw new Error(`Guilds not found`);
    }

    const guildExperienceMap = new Map(
      guilds.map((guild) => {
      const totalExperience = guild.players.reduce((sum, player) => sum + player.experience, 0);
      return [guild.id, totalExperience];
      })
    );
    let minExp = 101
    let guildWithMaxExperience = '';

    for (const [key, value] of guildExperienceMap) {
      if (value < minExp) {
        minExp = value;
        guildWithMaxExperience = key;
      }
    }

    const playerData: Prisma.PlayerUpdateInput = {
      guild: {
        connect: {
          id: guildWithMaxExperience,
        },
      },
    };

    return await this.playerRepository.updatePlayer(player.id, playerData);
  }
}