import { Router } from 'express';
import { PlayerRepository } from '../repositories/player.repository';
import { PlayerController } from '../adapters/http/player/player.controller';

const playerRouter = Router();

const playerRepository = new PlayerRepository();
const playerController = new PlayerController(playerRepository);

playerRouter.post('/', (req, res) => playerController.createPlayer(req, res));
playerRouter.get('/:id', (req, res) => playerController.getPlayer(req, res));
playerRouter.get('/', (req, res) => playerController.getAllPlayers(req, res));
playerRouter.put('/:id', (req, res) => playerController.updatePlayer(req, res));
playerRouter.delete('/:id', (req, res) => playerController.deletePlayer(req, res));

export default playerRouter;
