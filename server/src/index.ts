import express from 'express';
import cors from 'cors';
import { config } from './config.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`Server running in ${config.nodeEnv} mode`);
});

// Use the port from our config
app.listen(config.port, () => {
  console.log(`🚀 Server buzzing on http://localhost:${config.port}`);
});