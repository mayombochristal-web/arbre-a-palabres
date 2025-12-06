const mongoose = require('mongoose');
const path = require('path');

// Charge les variables d'environnement
if (process.env.NODE_ENV !== 'production') {
  // Essaie de charger .env dans le dossier courant (backend/)
  require('dotenv').config({ path: path.join(__dirname, '../.env') });

  // Debug info
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing from process.env after loading .env");
    console.error("   Looking for .env at:", path.join(__dirname, '../.env'));
  }
}

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is undefined");
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;