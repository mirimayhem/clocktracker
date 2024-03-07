import { PrismaClient } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import dayjs from "dayjs";

const prisma = new PrismaClient();

export default defineEventHandler(async (handler) => {
  const me: User | null = handler.context.user;
  const slug = handler.context.params!.slug;
  const year = handler.context.params!.year;
  const month = handler.context.params!.month;

  // Get the first day of the month
  const start = dayjs(`${year}-${month}-01`).toDate();
  // Get the first day of the next month
  const end = dayjs(start).add(1, "month").toDate();

  const event = await prisma.event.findMany({
    where: {
      community: {
        slug,
        banned_users: {
          none: {
            user_id: me?.id || "",
          },
        },
        OR: [
          {
            is_private: false,
          },
          {
            members: {
              some: {
                user_id: me?.id || "",
              },
            },
            is_private: true,
          },
        ],
      },
      start: {
        gte: start,
        lt: end,
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      start: true,
      end: true,
      location: true,
      location_type: true,
      player_count: true,
      image: true,
      who_can_register: true,
      registered_players: {
        select: {
          name: true,
          discord_user_id: true,
          created_at: true,
          user: {
            select: {
              user_id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          created_at: "asc",
        },
      },
      waitlists: {
        select: {
          id: true,
          name: true,
          default: true,
          created_at: true,
          users: {
            select: {
              name: true,
              created_at: true,
              discord_user_id: true,
              user: {
                select: {
                  user_id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              created_at: "asc",
            },
          },
        },
        orderBy: {
          created_at: "asc",
        },
      },
    },
  });

  if (!event) {
    throw createError({
      status: 404,
      statusMessage: "Not Found",
    });
  }

  return event;
});
