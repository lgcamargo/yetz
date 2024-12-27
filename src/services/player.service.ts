import { Player, Prisma } from '@prisma/client';
import { BalancedPlayersDTO, PlayerInputDTO} from '../adapters/http/player/dto/player.dto';
import { PlayerRepository } from '../repositories/player.repository';
import { GuildRepository } from '../repositories/guild.repository';
import { hasRequiredClasses } from '../utils/requiredClass';

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

  async balancedPlayer(body: BalancedPlayersDTO) {
    const players = body.selectedPlayers;
    const maxPlayers = body.maxGuildPlayers;
    const guilds = await this.guildRepository.getAllGuilds();
    if (guilds.length === 0) {
      throw new Error(`Guilds not found`);
    }

    const unassignedPlayers = players.filter((player) => !player.guildId);
  
    const classCounts = {
      GUERREIRO: unassignedPlayers.filter((p) => p.class === 'GUERREIRO').length,
      CLÉRIGO: unassignedPlayers.filter((p) => p.class === 'CLÉRIGO').length,
      MAGO_ARQUEIRO: unassignedPlayers.filter((p) => ['MAGO', 'ARQUEIRO'].includes(p.class)).length,
    };
  
    if (
      classCounts.GUERREIRO < guilds.length ||
      classCounts.CLÉRIGO < guilds.length ||
      classCounts.MAGO_ARQUEIRO < guilds.length
    ) {
      throw new Error(`Not enough players in each class to distribute to the guilds`);
    }
  
    const guildInfo = guilds.map((guild) => ({
      id: guild.id,
      players: [...guild.players],
      totalExp: guild.players.reduce((sum, player) => sum + player.experience, 0),
    }));
  
    const getNextGuild = (className: string) => {
      const eligibleGuilds = guildInfo.filter((guild) => guild.players.length < maxPlayers);
      if (eligibleGuilds.length === 0) {
        return null;
      }

      //ordenação de guils baseado em necessidade de classe, caso não tenha valida a com menor experiência
      const sortedGuilds = eligibleGuilds.sort((a, b) => {
        const aNeedsClass = !a.players.some((p) => p.class === className);
        const bNeedsClass = !b.players.some((p) => p.class === className);
    
        if (aNeedsClass && !bNeedsClass) return -1;
        if (!aNeedsClass && bNeedsClass) return 1;
    
        return a.totalExp - b.totalExp;
      });
    
      const selectedGuild = sortedGuilds[0];
    
      if (!selectedGuild) {
        console.warn(`No guild found for class: ${className}`);
      }
    
      return selectedGuild;
    };
    
    for (const player of unassignedPlayers) {
      const guild = getNextGuild(player.class);
      if (!guild) {
        console.warn(`No guild found for player ${player.name}`);
        continue;
      }

      const playerData: Prisma.PlayerUpdateInput = {
        guild: { connect: { id: guild.id } },
      };
      await this.playerRepository.updatePlayer(player.id, playerData);
  
      //atualiza guildas localmente
      guild.players.push(player as Player);
      guild.totalExp += player.experience;
    }

    const balancedGuilds = await this.guildRepository.getAllGuilds();
    if (balancedGuilds.length === 0) {
      throw new Error(`Balanced guilds not found`);
    }

    return balancedGuilds;
  }  

  async resetPlayersGuild() {
    const players = await this.playerRepository.getAllPlayers();

    for (const player of players) {
      const playerData: Prisma.PlayerUpdateInput = {
        guild: {
          disconnect: true,
        },
      };
      await this.playerRepository.updatePlayer(player.id, playerData);
    }
    
    return await this.playerRepository.getAllPlayers();
  }
}