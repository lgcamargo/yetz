import { Request, Response } from 'express';
import { GuildService } from '../../../services/guild.service';
import { GuildInputDTO, GuildOutputDTO } from './dto/guild.dto';
import { GuildRepository } from '../../../repositories/guild.repository';
import { Player } from '../../../domain/entities/player.entity';
import { validate } from 'class-validator';

export class GuildController {
  private guildService: GuildService;

  constructor(guildRepository: GuildRepository) {
    this.guildService = new GuildService(guildRepository);
  }

  public async createGuild(req: Request, res: Response): Promise<void> {
    try {
      const guildData: GuildInputDTO = req.body;

      const errors = await validate(guildData);
      
      if (errors.length > 0) {
        res.status(400).json({
          message: "Validation failed",
          errors: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }
      
      const newGuild = await this.guildService.createGuild(guildData);
      const outputGuild: GuildOutputDTO = {
        id: newGuild.id,
        name: newGuild.name,
        createdAt: newGuild.createdAt,
        updatedAt: newGuild.updatedAt,
        deletedAt: newGuild.deletedAt,
      };
      res.status(201).json(outputGuild);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async getGuild(req: Request, res: Response): Promise<void> {
    try {
      const guildId = req.params.id;
      const guild = await this.guildService.getGuildById(guildId);
      if (!guild) {
        res.status(404).json({ message: 'Guild not found' });
        return;
      }
      const outputGuild: GuildOutputDTO = {
        id: guild.id,
        name: guild.name,
        players: guild.players as Player[],
        createdAt: guild.createdAt,
        updatedAt: guild.updatedAt,
        deletedAt: guild.deletedAt,
      };

      res.status(200).json(outputGuild);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async getAllGuilds(req: Request, res: Response): Promise<void> {
    try {
      const guilds = await this.guildService.getAllGuilds();
      if (guilds.length === 0) {
        res.status(404).json({ message: 'Guilds not found' });
        return;
      }
      const outputGuilds: GuildOutputDTO[] = guilds.map((guild) => ({
        id: guild.id,
        name: guild.name,
        players: guild.players as Player[],
        createdAt: guild.createdAt,
        updatedAt: guild.updatedAt,
        deletedAt: guild.deletedAt,
      }));

      res.status(200).json(outputGuilds);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async updateGuild(req: Request, res: Response): Promise<void> {
    try {
      const guildId = req.params.id;
      if (!guildId) {
        res.status(400).json({ message: 'Guild ID is required' });
        return;
      }
      const guildData: GuildInputDTO = req.body;
      
      const errors = await validate(guildData);
      
      if (errors.length > 0) {
        res.status(400).json({
          message: "Validation failed",
          errors: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      const updatedGuild = await this.guildService.updateGuild(guildId, guildData);
      if (!updatedGuild) {
        res.status(404).json({ message: 'Guild not found' });
        return;
      }
      const outputGuild: GuildOutputDTO = {
        id: updatedGuild.id,
        name: updatedGuild.name,
        createdAt: updatedGuild.createdAt,
        updatedAt: updatedGuild.updatedAt,
        deletedAt: updatedGuild.deletedAt,
      };
      res.status(200).json(outputGuild);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async deleteGuild(req: Request, res: Response): Promise<void> {
    try {
      const guildId = req.params.id;
      await this.guildService.deleteGuild(guildId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}