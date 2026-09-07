const mongoose = require('mongoose');

async function connectDB() {
  mongoose.set('strictQuery', true);

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('FATAL ERROR: MONGODB_URI environment variable is not defined.');
    console.error('Please set MONGODB_URI in your .env file or hosting provider dashboard.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { connectDB };
