import { Request, Response } from 'express';
import { PlayerService } from '../../../services/player.service';
import { BalancedPlayersDTO, PlayerInputDTO, PlayerOutputDTO } from './dto/player.dto';
import { PlayerRepository } from '../../../repositories/player.repository';
import { GuildRepository } from '../../../repositories/guild.repository';
import { validate } from 'class-validator';
import 'reflect-metadata';

export class PlayerController {
  private playerService: PlayerService;

  constructor(playerRepository: PlayerRepository, guildRepository: GuildRepository) {
    this.playerService = new PlayerService(playerRepository, guildRepository);
  }

  public async createPlayer(req: Request, res: Response): Promise<void> {
    try {
      const playerData: PlayerInputDTO = req.body;

      const errors = await validate(new PlayerInputDTO(req.body), {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
      });
      
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

      const newPlayer = await this.playerService.createPlayer(playerData);
      const outputPlayer: PlayerOutputDTO = {
        id: newPlayer.id,
        name: newPlayer.name,
        class: newPlayer.class,
        experience: newPlayer.experience,
        guildId: newPlayer.guildId,
        createdAt: newPlayer.createdAt,
        updatedAt: newPlayer.updatedAt,
        deletedAt: newPlayer.deletedAt,
      };

      res.status(201).json(outputPlayer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async getPlayer(req: Request, res: Response): Promise<void> {
    try {
      const playerId = req.params.id;
      const player = await this.playerService.getPlayerById(playerId);

      if (!player) {
        res.status(404).json({ message: 'Player not found' });
        return;
      }

      const outputPlayer: PlayerOutputDTO = {
        id: player.id,
        name: player.name,
        class: player.class,
        experience: player.experience,
        guildId: player.guildId,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
        deletedAt: player.deletedAt,
      };
      res.status(200).json(player);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async getAllPlayers(req: Request, res: Response): Promise<void> {
    try {
      const players = await this.playerService.getAllPlayers();
      if (players.length === 0) {
        res.status(404).json({ message: 'Players not found' });
        return;
      }
      const outputPlayers: PlayerOutputDTO[] = players.map((player) => ({
        id: player.id,
        name: player.name,
        class: player.class,
        experience: player.experience,
        guildId: player.guildId,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
        deletedAt: player.deletedAt,
      }));
      res.status(200).json(outputPlayers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async updatePlayer(req: Request, res: Response): Promise<void> {
    try {
      const playerId = req.params.id;
      if (!playerId) {
        res.status(400).json({ message: 'Player ID is required' });
        return;
      }
      const playerData: PlayerInputDTO = req.body;

      const errors = await validate(new PlayerInputDTO(req.body), {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
      });

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

      const updatedPlayer = await this.playerService.updatePlayer(playerId, playerData);

      if (!updatedPlayer) {
        res.status(404).json({ message: 'Player not found' });
        return;
      }

      const outputPlayer: PlayerOutputDTO = {
        id: updatedPlayer.id,
        name: updatedPlayer.name,
        class: updatedPlayer.class,
        experience: updatedPlayer.experience,
        guildId: updatedPlayer.guildId,
        createdAt: updatedPlayer.createdAt,
        updatedAt: updatedPlayer.updatedAt,
        deletedAt: updatedPlayer.deletedAt,
      };
      res.status(200).json(outputPlayer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async deletePlayer(req: Request, res: Response): Promise<void> {
    try {
      const playerId = req.params.id;
      await this.playerService.deletePlayer(playerId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async balancedPlayer(req: Request, res: Response): Promise<void> {
    try {
      const body: BalancedPlayersDTO = req.body;
      if (body.maxGuildPlayers < 3) {
        res.status(400).json({ message: 'Max guild players must be at least 3' });
        return;
      }
      const balancedPlayer = await this.playerService.balancedPlayer(body);
      res.status(200).json(balancedPlayer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public async resetPlayersGuild(req: Request, res: Response): Promise<void> {
    try {
      const resetedPlayers = await this.playerService.resetPlayersGuild();
      res.status(200).json(resetedPlayers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}