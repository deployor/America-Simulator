import express from 'express';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`America Simulator running at http://localhost:${port}`);
  console.log(`(Circles will run away from your cursor. Good luck trying to click them!)`);
});