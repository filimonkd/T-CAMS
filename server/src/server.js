require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 4000;

async function start() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Copy server/.env.example to server/.env and set a real secret.');
  }
  await connectDB();
  app.listen(PORT, () => {
    console.log(`T-CAMS server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
