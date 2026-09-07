import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { env } from "./env";

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
  });
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (env.nodeEnv !== "production") globalThis.prismaGlobal = prisma;

export type Db = PrismaClient | Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
