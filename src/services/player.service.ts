import { Player, Prisma } from '@prisma/client';
import { PlayerInputDTO} from '../adapters/http/player/dto/player.dto';
import { PlayerRepository } from '../repositories/player.repository';
import { GuildRepository } from '../repositories/guild.repository';
import { Guild } from '../domain/entities/guild.entity';

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
    if (player.name) {
      const alreadyExists = await this.playerRepository.getPlayerByName(player.name);
      if (alreadyExists && alreadyExists.id !== id) {
        throw new Error(`Player with name ${player.name} already exists`);
      }
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

  async balancedPlayer(maxGuildPlayers: number) {
    const players = await this.playerRepository.getAllPlayers();
    if (!players || players.length === 0) {
      throw new Error(`Players not found`);
    }

    const guilds = await this.guildRepository.getAllGuilds();
    if (guilds.length === 0) {
      throw new Error(`Guilds not found`);
    }

    const unassignedPlayers = players.filter((player) => !player.guildId);

    for (const player of unassignedPlayers) {
      let guildsInfo: { guildId: string; guildExp: number; needsClass: boolean }[] = [];

      for (const guild of guilds) {
        if (guild.players.length >= maxGuildPlayers) {
          continue;
        }

        const totalExperience = guild.players.reduce((sum, p) => sum + p.experience, 0);

        const classes = guild.players.map((p) => p.class);
        const needsClass = !classes.includes(player.class);

        guildsInfo.push({
          guildId: guild.id,
          guildExp: totalExperience,
          needsClass,
        });
      }

      guildsInfo.sort((a, b) => {
        if (a.needsClass && !b.needsClass) {
          return -1;
        }
        if (!a.needsClass && b.needsClass) {
          return 1;
        }
        if (a.guildExp < b.guildExp) {
          return -1;
        }
        if (a.guildExp > b.guildExp) {
          return 1;
        }
        return 0;
      });

      if (guildsInfo.length > 0) {
        const selectedGuildId = guildsInfo[0].guildId;
        const playerData: Prisma.PlayerUpdateInput = {
          guild: {
            connect: { id: selectedGuildId },
          },
        };
        await this.playerRepository.updatePlayer(player.id, playerData);

        const selectedGuild = guilds.find((g) => g.id === selectedGuildId);
        if (selectedGuild) {
          selectedGuild.players.push(player);
        }
      } else {
        console.warn(`No suitable guild found for player ${player.name}`);
      }
    }

    const balancedGuilds = await this.guildRepository.getAllGuilds();
    if (balancedGuilds.length === 0) {
      throw new Error(`Balanced guilds not found`);
    }

    return balancedGuilds;
  }
}