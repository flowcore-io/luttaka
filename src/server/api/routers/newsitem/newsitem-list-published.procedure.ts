import { and, eq, lt } from "drizzle-orm"

import { db } from "@/database"
import { newsitems } from "@/database/schemas"
import { protectedProcedure } from "@/server/api/trpc"

export const getNewsitemsPublishedProcedure = protectedProcedure.query(
  async () => {
    return (
      (await db
        .select({
          id: newsitems.id,
          title: newsitems.title,
          imageUrl: newsitems.imageUrl,
          introText: newsitems.introText,
          fullText: newsitems.fullText,
          publicVisibility: newsitems.publicVisibility,
          publishedAt: newsitems.publishedAt,
          archived: newsitems.archived,
          reason: newsitems.reason,
        })
        .from(newsitems)
        .where(
          and(
            eq(newsitems.archived, false),
            lt(newsitems.publishedAt, new Date().toISOString()),
          ),
        )
        .execute()) || []
    )
  },
)