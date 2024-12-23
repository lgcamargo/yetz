import { Guild, Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class GuildRepository {
  async createGuild(data: Prisma.GuildCreateInput) {
    try {
      const guild = await prisma.guild.create({
        data,
      });
      return guild;
    } catch (error: any) {
      throw new Error('Error creating guild: ' + error.message);
    }
  }

  async getAllGuilds() {
    try {
      const guilds = await prisma.guild.findMany({
        include: { players: true },
      });
      return guilds;
    } catch (error: any) {
      throw new Error('Error fetching guilds: ' + error.message);
    }
  }

  async getGuildById(guildId: string) {
    try {
      const guild = await prisma.guild.findUnique({
        where: { id: guildId },
        include: { players: true },
      });
      return guild;
    } catch (error: any) {
      throw new Error('Error fetching guild: ' + error.message);
    }
  }

  async updateGuild(guildId: string, data: Prisma.GuildUpdateInput) {
    try {
      const guild = await prisma.guild.update({
        where: { id: guildId },
        data,
      });
      return guild;
    } catch (error: any) {
      throw new Error('Error updating guild: ' + error.message);
    }
  }

  async deleteGuild(guildId:string) {
    try {
      const guild = await prisma.guild.delete({
        where: { id: guildId },
      });
      return guild;
    } catch (error: any) {
      throw new Error('Error deleting guild: ' + error.message);
    }
  }
}

export { GuildRepository };
