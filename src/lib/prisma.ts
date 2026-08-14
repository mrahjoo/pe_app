import { PrismaClient } from '../generated/prisma/client/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const prismaClientSingleton = () => {
  const dbUrl = (process.env.DATABASE_URL || 'file:./dev.db').replace('file:', '');
  const db = new Database(dbUrl);
  const adapter = new PrismaBetterSqlite3(db);
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
