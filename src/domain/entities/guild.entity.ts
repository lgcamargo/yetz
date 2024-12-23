import { Player } from "./player.entity";

export type Guild = {
  id: string;
  name: string;
  players?: Player[];
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
