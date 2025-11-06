import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/tifosi-cuore';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB conectado correctamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('🔌 MongoDB desconectado');
  } catch (error) {
    console.error('Error desconectando MongoDB:', error);
  }
};