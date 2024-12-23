export type Player = {
  id: string;
  name: string;
  class: string;
  experience: number;
  guildId: string;
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
