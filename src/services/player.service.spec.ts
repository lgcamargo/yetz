import { PlayerService } from './player.service';
import { PlayerRepository } from '../repositories/player.repository';
import { GuildRepository } from '../repositories/guild.repository';
import { BalancedPlayersDTO, PlayerInputDTO } from '../adapters/http/player/dto/player.dto';

describe('PlayerService', () => {
  let playerService: PlayerService;
  let playerRepository: jest.Mocked<PlayerRepository>;
  let guildRepository: jest.Mocked<GuildRepository>;

  beforeEach(() => {
    playerRepository = {
      getPlayerById: jest.fn(),
      getAllPlayers: jest.fn(),
      createPlayer: jest.fn(),
      updatePlayer: jest.fn(),
      deletePlayer: jest.fn(),
      getPlayerByName: jest.fn(),
    } as jest.Mocked<PlayerRepository>;

    guildRepository = {
      getAllGuilds: jest.fn(),
    } as unknown as jest.Mocked<GuildRepository>;

    playerService = new PlayerService(playerRepository, guildRepository);
  });

  describe('createPlayer', () => {
    it('should create a player successfully', async () => {
      const input: PlayerInputDTO = {
        name: 'TestPlayer',
        class: 'GUERREIRO',
        experience: 100,
        guildId: 'test-guild-id',
      };

      playerRepository.getPlayerByName.mockResolvedValue(null);
      playerRepository.createPlayer.mockResolvedValue({
        id: 'test-player-id',
        guildId: input.guildId || '',
        experience: input.experience,
        class: input.class,
        name: input.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result = await playerService.createPlayer(input);

      expect(playerRepository.getPlayerByName).toHaveBeenCalledWith('TestPlayer');
      expect(result.name).toBe('TestPlayer');
    });

    it('should throw an error if a player with the same name already exists', async () => {
      const input: PlayerInputDTO = {
        name: 'TestPlayer',
        class: 'GUERREIRO',
        experience: 1000,
        guildId: 'test-guild-id',
      };

      playerRepository.getPlayerByName.mockResolvedValue({
        id: 'existing-id',
        guildId: input.guildId || '',
        experience: input.experience,
        class: input.class,
        name: input.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(playerService.createPlayer(input)).rejects.toThrow(
        'Player with name TestPlayer already exists'
      );
    });
  });

  describe('balancedPlayer', () => {
    it('should balance players among guilds', async () => {
      const players = [
        { id: 'p1', name: 'Player1', class: 'GUERREIRO', guildId: '', experience: 500, createdAt: new Date(), updatedAt: new Date(), deletedAt: undefined },
        { id: 'p2', name: 'Player2', class: 'GUERREIRO', guildId: '', experience: 500, createdAt: new Date(), updatedAt: new Date(), deletedAt: undefined },
        { id: 'p3', name: 'Player3', class: 'CLÉRIGO', guildId: '', experience: 600, createdAt: new Date(), updatedAt: new Date(), deletedAt: undefined },
        { id: 'p4', name: 'Player4', class: 'CLÉRIGO', guildId: '', experience: 600, createdAt: new Date(), updatedAt: new Date(), deletedAt: undefined },
        { id: 'p5', name: 'Player5', class: 'MAGO', guildId: '', experience: 600, createdAt: new Date(), updatedAt: new Date(), deletedAt: undefined },
        { id: 'p6', name: 'Player6', class: 'ARQUEIRO', guildId: '', experience: 600, createdAt: new Date(), updatedAt: new Date(), deletedAt: undefined },
      ];

      const guilds = [
        { id: 'g1', name: 'Guild1', players: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: 'g2', name: 'Guild2', players: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      ];

      const body: BalancedPlayersDTO = {
        selectedPlayers: players,
        maxGuildPlayers: 3,
      };

      guildRepository.getAllGuilds.mockResolvedValue(guilds);
      playerRepository.updatePlayer.mockResolvedValue({} as any);

      const result = await playerService.balancedPlayer(body);

      expect(guildRepository.getAllGuilds).toHaveBeenCalled();
      expect(result).toEqual(expect.any(Array));
    });

    it('should throw an error if there are not enough classes to distribute', async () => {
      const players = [
        { id: 'p1', name: 'Player1', class: 'GUERREIRO', guildId: '', experience: 500, createdAt: new Date(), updatedAt: new Date(), deletedAt: undefined},
      ];

      const guilds = [
        { id: 'g1', name: 'Guild1', players: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null},
        { id: 'g2', name: 'Guild2', players: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null},
      ];

      const body: BalancedPlayersDTO = {
        selectedPlayers: players,
        maxGuildPlayers: 10,
      };

      guildRepository.getAllGuilds.mockResolvedValue(guilds);

      await expect(playerService.balancedPlayer(body)).rejects.toThrow(
        'Not enough players in each class to distribute to the guilds'
      );
    });
  });

  describe('resetPlayersGuild', () => {
    it('should reset all players guilds', async () => {
      const players = [
        { id: 'p1', name: 'Player1', class: 'GUERREIRO', guildId: 'g1', experience: 500, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      ];

      playerRepository.getAllPlayers.mockResolvedValue(players);
      playerRepository.updatePlayer.mockResolvedValue({} as any);

      const result = await playerService.resetPlayersGuild();

      expect(playerRepository.getAllPlayers).toHaveBeenCalled();
      expect(playerRepository.updatePlayer).toHaveBeenCalledTimes(1);
      expect(result).toEqual(players);
    });
  });
});
