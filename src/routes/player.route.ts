import { Router } from 'express';
import { PlayerRepository } from '../repositories/player.repository';
import { PlayerController } from '../adapters/http/player/player.controller';
import { GuildRepository } from '../repositories/guild.repository';

const playerRouter = Router();

const playerRepository = new PlayerRepository();
const guildRepository = new GuildRepository();
const playerController = new PlayerController(playerRepository, guildRepository);

playerRouter.post('/', (req, res) => playerController.createPlayer(req, res));
playerRouter.get('/:id', (req, res) => playerController.getPlayer(req, res));
playerRouter.get('/', (req, res) => playerController.getAllPlayers(req, res));
playerRouter.put('/:id', (req, res) => playerController.updatePlayer(req, res));
playerRouter.delete('/:id', (req, res) => playerController.deletePlayer(req, res));
playerRouter.post('/balanced/:id', (req, res) => playerController.balancedPlayer(req, res));
playerRouter.post('/reset-players-guild', (req, res) => playerController.resetPlayersGuild(req, res));

export default playerRouter;
