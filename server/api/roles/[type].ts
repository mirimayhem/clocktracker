import { PrismaClient, RoleType } from "@prisma/client";
// @ts-ignore
import dayjs from "dayjs";

const prisma = new PrismaClient();

export default defineEventHandler(async (handler) => {
  const typeString = handler.context.params?.type as string;

  const type = RoleType[typeString.toUpperCase() as keyof typeof RoleType];

  const roles = await prisma.role.findMany({
    where: {
      type,
    },
  });

  if (!roles) {
    console.error(`Roles not found for type ${type}`);
    throw createError({
      status: 404,
      statusMessage: "Not Found",
    });
  }

  return roles;
});
