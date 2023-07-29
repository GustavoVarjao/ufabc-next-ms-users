import { Config } from '@/config/secret';
import { connect } from 'mongoose';

// TODO: MIgrate to a plugin so i can log stuff
export async function connectToMongo() {
  try {
    const connection = await connect(Config.MONGODB_CONNECTION_URL);
    return connection;
  } catch (error) {
    console.error('Error connecting to mongo:', error);
    throw error;
  }
}
