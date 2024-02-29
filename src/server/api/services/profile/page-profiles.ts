import {db} from "@/database";
import {getInitialsFromString} from "@/server/lib/format/get-initials-from-string";
import {type UserProfile} from "@/contracts/profile/user-profile";
import {type PaginationInput} from "@/contracts/pagination/pagination";
import {type z} from "zod";
import {count} from "drizzle-orm";
import {profiles} from "@/database/schemas";
import {type PagedProfileResult} from "@/contracts/profile/paged-profiles";

export const pageProfiles = async (input: z.infer<typeof PaginationInput>): Promise<PagedProfileResult> => {

  const safePage = (Math.max(input.page - 1, 0));

  const profiles = await db.query.profiles.findMany({
    offset: safePage * input.pageSize,
    limit: input.pageSize,
    orderBy: (profile, {asc}) => [asc(profile.firstName)]
  });

  if (!profiles.length) {
    return {
      items: [],
      page: 0,
      pageSize: 0,
    };
  }

  return {
    page: input.page,
    pageSize: profiles.length,
    items: profiles.map((profile): UserProfile => {
      const displayName = `${profile.firstName} ${profile.lastName}`;
      const initials = getInitialsFromString(displayName);
      return {
        id: profile.id,
        userId: profile.userId,
        displayName: displayName,
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        title: profile.title ?? "",
        description: profile.description ?? "",
        socials: profile.socials ?? "",
        company: profile.company ?? "",
        avatarUrl: profile.avatarUrl ?? "",
        initials
      }
    })
  }
}

// todo: convert this to only fetch the number of profiles associated a relevant conference
export const getTotalNumberOfProfiles = async (): Promise<number> => {
  return db
    .select({value: count()})
    .from(profiles)
    .then((result) => result[0]?.value ?? 0);
}