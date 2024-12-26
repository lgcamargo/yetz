import { Prisma, PrismaClient } from '@prisma/client';
import { Player } from '../domain/entities/player.entity';

const prisma = new PrismaClient();

class PlayerRepository {
  async createPlayer(data: Prisma.PlayerCreateInput) {
    try {
      const player = await prisma.player.create({
        data,
      });
      return player;
    } catch (error: any) {
      throw new Error('Error creating player: ' + error.message);
    }
  }
  async getAllPlayers(filters?: { name?: string; class?: string; minExperience?: number; maxExperience?: number }) {
    try {
      const players = await prisma.player.findMany({
        where: {
          name: filters?.name ? { contains: filters.name, mode: 'insensitive' } : undefined,
          class: filters?.class,
          experience: {
            gte: filters?.minExperience,
            lte: filters?.maxExperience,
          },
        },
      });
      return players;
    } catch (error: any) {
      throw new Error('Error fetching players: ' + error.message);
    }
  }  

  async getPlayerById(playerId: string) {
    try {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
      });
      return player;
    } catch (error: any) {
      throw new Error('Error fetching player: ' + error.message);
    }
  }

  async updatePlayer(playerId: string, data: Prisma.PlayerUpdateInput) {
    try {
      const player = await prisma.player.update({
        where: { id: playerId },
        data,
      });
      return player;
    } catch (error: any) {
      throw new Error('Error updating player: ' + error.message);
    }
  }

  async deletePlayer(playerId:string) {
    try {
      const player = await prisma.player.delete({
        where: { id: playerId },
      });
      return player;
    } catch (error: any) {
      throw new Error('Error deleting player: ' + error.message);
    }
  }

  async getPlayerByName(name: string) {
    return await prisma.player.findFirst({
      where: { name },
    });
  }
}

export { PlayerRepository };
