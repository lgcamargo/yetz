import express from 'express';
import playerRouter from './routes/player.route';
import guildRouter from './routes/guild.route';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/player', playerRouter);
app.use('/guild', guildRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
