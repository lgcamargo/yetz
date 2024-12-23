import { Router } from 'express';
import { GuildRepository } from '../repositories/guild.repository';
import { GuildController } from '../adapters/http/guild/guild.controller';

const guildRouter = Router();

const guildRepository = new GuildRepository();
const guildController = new GuildController(guildRepository);

guildRouter.post('/', (req, res) => guildController.createGuild(req, res));
guildRouter.get('/:id', (req, res) => guildController.getGuild(req, res));
guildRouter.get('/', (req, res) => guildController.getAllGuilds(req, res));
guildRouter.put('/:id', (req, res) => guildController.updateGuild(req, res));
guildRouter.delete('/:id', (req, res) => guildController.deleteGuild(req, res));

export default guildRouter;
