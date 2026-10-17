import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const rawUrl = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/tony_prakash_music?directConnection=true';
export const mongoClient = new MongoClient(rawUrl);

let isConnected = false;
export async function getMongoDb() {
  if (!isConnected) {
    await mongoClient.connect();
    isConnected = true;
  }
  return mongoClient.db('tony_prakash_music');
}

export interface UserDoc {
  _id?: ObjectId;
  id?: string;
  email: string;
  name: string;
  passwordHash?: string | null;
  phone?: string | null;
  avatar?: string | null;
  provider?: string;
  googleId?: string | null;
  facebookId?: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function findOrCreateGoogleUser(data: {
  email: string;
  name: string;
  avatar?: string | null;
  googleId?: string | null;
}) {
  const db = await getMongoDb();
  const users = db.collection<UserDoc>('User');
  const normalizedEmail = data.email.toLowerCase().trim();

  let user = await users.findOne({ email: normalizedEmail });
  if (!user && data.googleId) {
    user = await users.findOne({ googleId: data.googleId });
  }

  if (!user) {
    const now = new Date();
    const newUser: UserDoc = {
      email: normalizedEmail,
      name: data.name || 'Google User',
      avatar: data.avatar || null,
      googleId: data.googleId || null,
      provider: 'GOOGLE',
      role: 'USER',
      createdAt: now,
      updatedAt: now,
    };
    const res = await users.insertOne(newUser as any);
    return {
      id: res.insertedId.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar,
    };
  }

  // User exists: update googleId or avatar if not yet set
  const setUpdates: any = {};
  if (data.googleId && !user.googleId) setUpdates.googleId = data.googleId;
  if (data.avatar && !user.avatar) setUpdates.avatar = data.avatar;

  if (Object.keys(setUpdates).length > 0) {
    setUpdates.updatedAt = new Date();
    await users.updateOne({ _id: user._id }, { $set: setUpdates });
  }

  return {
    id: user._id!.toString(),
    email: user.email,
    name: user.name,
    role: user.role || 'USER',
    avatar: setUpdates.avatar || user.avatar,
  };
}

export async function createLocalUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
}) {
  const db = await getMongoDb();
  const users = db.collection<UserDoc>('User');
  const normalizedEmail = data.email.toLowerCase().trim();

  const now = new Date();
  const newUser: UserDoc = {
    email: normalizedEmail,
    passwordHash: data.passwordHash,
    name: data.name.trim(),
    phone: data.phone?.trim() || null,
    provider: 'LOCAL',
    role: 'USER',
    createdAt: now,
    updatedAt: now,
  };

  const res = await users.insertOne(newUser as any);
  return {
    id: res.insertedId.toString(),
    email: newUser.email,
    name: newUser.name,
    phone: newUser.phone,
    role: newUser.role,
    createdAt: newUser.createdAt,
  };
}
