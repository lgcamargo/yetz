import { Player, Prisma } from '@prisma/client';
import { PlayerInputDTO} from '../adapters/http/player/dto/player.dto';
import { PlayerRepository } from '../repositories/player.repository';

export class PlayerService {
  private playerRepository: PlayerRepository;

  constructor(playerRepository: PlayerRepository) {
    this.playerRepository = playerRepository;
  }

  async getPlayerById(id: string) {
    return await this.playerRepository.getPlayerById(id);
  }

  async getAllPlayers() {
    return await this.playerRepository.getAllPlayers();
  }
  async createPlayer(player: PlayerInputDTO): Promise<Player> {
    const playerData: Prisma.PlayerCreateInput = {
      name: player.name,
      class: player.class,
      experience: player.experience,
      createdAt: new Date(),
      updatedAt: new Date(),
      guild: {
        connect: {
          id: player.guildId,
        },
      },
    };

    return await this.playerRepository.createPlayer(playerData);
  }
  async updatePlayer(id: string, player: PlayerInputDTO) {
    const playerData: Prisma.PlayerUpdateInput = {
      name: player.name,
      class: player.class,
      experience: player.experience,
      updatedAt: new Date(),
      guild: {
        connect: {
          id: player.guildId,
        },
      },
    };

    return await this.playerRepository.updatePlayer(id, playerData);
  }

  async deletePlayer(id: string) {
    return await this.playerRepository.deletePlayer(id);
  }
}