import { GuildService } from './guild.service';
import { GuildRepository } from '../repositories/guild.repository';
import { GuildInputDTO } from '../adapters/http/guild/dto/guild.dto';

describe('GuildService', () => {
  let guildService: GuildService;
  let guildRepository: jest.Mocked<GuildRepository>;

  beforeEach(() => {
    guildRepository = {
      getGuildById: jest.fn(),
      getAllGuilds: jest.fn(),
      createGuild: jest.fn(),
      updateGuild: jest.fn(),
      deleteGuild: jest.fn(),
      getGuildByName: jest.fn(),
    } as jest.Mocked<GuildRepository>;

    guildService = new GuildService(guildRepository);
  });

  describe('getGuildById', () => {
    it('should retrieve a guild by its ID', async () => {
      const guild = { id: 'test-id', name: 'Test Guild', players: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      guildRepository.getGuildById.mockResolvedValue(guild);

      const result = await guildService.getGuildById('test-id');

      expect(guildRepository.getGuildById).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(guild);
    });
  });

  describe('getAllGuilds', () => {
    it('should retrieve all guilds', async () => {
      const guilds = [
        { id: 'g1', name: 'Guild 1', players: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null},
        { id: 'g2', name: 'Guild 2', players: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null},
      ];
      guildRepository.getAllGuilds.mockResolvedValue(guilds);

      const result = await guildService.getAllGuilds();

      expect(guildRepository.getAllGuilds).toHaveBeenCalled();
      expect(result).toEqual(guilds);
    });
  });

  describe('createGuild', () => {
    it('should create a new guild successfully', async () => {
      const input: GuildInputDTO = { name: 'New Guild' };
      const createdGuild = { id: 'g1',...input, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      
      guildRepository.getGuildByName.mockResolvedValue(null);
      guildRepository.createGuild.mockResolvedValue(createdGuild);

      const result = await guildService.createGuild(input);

      expect(guildRepository.getGuildByName).toHaveBeenCalledWith('New Guild');
      expect(guildRepository.createGuild).toHaveBeenCalledWith(expect.objectContaining(input));
      expect(result).toEqual(createdGuild);
    });

    it('should throw an error if a guild with the same name already exists', async () => {
      const input: GuildInputDTO = { name: 'Existing Guild' };
      guildRepository.getGuildByName.mockResolvedValue({ id: 'g1', ...input, createdAt: new Date(), updatedAt: new Date(), deletedAt: null });

      await expect(guildService.createGuild(input)).rejects.toThrow(
        'Guild with name Existing Guild already exists'
      );
    });
  });

  describe('updateGuild', () => {
    it('should update a guild successfully', async () => {
      const input: GuildInputDTO = { name: 'Updated Guild' };
      const updatedGuild = { id: 'g1', ...input, createdAt: new Date(), updatedAt: new Date(), deletedAt: null};

      guildRepository.getGuildByName.mockResolvedValue(null);
      guildRepository.updateGuild.mockResolvedValue(updatedGuild);

      const result = await guildService.updateGuild('g1', input);

      expect(guildRepository.getGuildByName).toHaveBeenCalledWith('Updated Guild');
      expect(guildRepository.updateGuild).toHaveBeenCalledWith('g1', expect.objectContaining(input));
      expect(result).toEqual(updatedGuild);
    });

    it('should throw an error if a guild with the same name already exists', async () => {
      const input: GuildInputDTO = { name: 'Existing Guild' };
      guildRepository.getGuildByName.mockResolvedValue({ id: 'g2', ...input, createdAt: new Date(), updatedAt: new Date(), deletedAt: null});

      await expect(guildService.updateGuild('g1', input)).rejects.toThrow(
        'Guild with name Existing Guild already exists'
      );
    });
  });

  describe('deleteGuild', () => {
    it('should delete a guild successfully', async () => {
      guildRepository.deleteGuild.mockResolvedValue({ id: 'g1', name: 'Deleted Guild', createdAt: new Date(), updatedAt: new Date(), deletedAt: null});

      const result = await guildService.deleteGuild('g1');

      expect(guildRepository.deleteGuild).toHaveBeenCalledWith('g1');
      expect(result).toEqual(expect.objectContaining({ id: 'g1', name: 'Deleted Guild' }));
    });
  });
});
