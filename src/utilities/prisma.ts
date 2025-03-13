import { PrismaClient } from "@prisma/client";

export let prisma = new PrismaClient();

export const setDataSource = (datasourceUrl: string) => {
  prisma = new PrismaClient({
    datasourceUrl,
  });
};
