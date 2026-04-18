import type { PrismaClient } from "@prisma/client";

import { TAXONOMY_GEARS } from "./discussion-taxonomy-data";

/**
 * Upserts 20 taxonomy Gears (ForumSpace) and Lower Gears (ForumCategory) from
 * CARMUNITY_DISCUSSIONS_TAXONOMY.md. Idempotent; does not remove legacy spaces.
 */
export async function ensureTaxonomyGearsFromDoc(prisma: PrismaClient): Promise<void> {
  for (const gear of TAXONOMY_GEARS) {
    const space = await prisma.forumSpace.upsert({
      where: { slug: gear.slug },
      create: {
        slug: gear.slug,
        title: gear.title,
        description: gear.description,
        sortOrder: gear.sortOrder,
        isActive: true,
      },
      update: {
        title: gear.title,
        description: gear.description,
        sortOrder: gear.sortOrder,
        isActive: true,
      },
    });

    for (const lg of gear.lowers) {
      await prisma.forumCategory.upsert({
        where: { spaceId_slug: { spaceId: space.id, slug: lg.slug } },
        create: {
          spaceId: space.id,
          slug: lg.slug,
          title: lg.title,
          sortOrder: lg.sortOrder,
        },
        update: {
          title: lg.title,
          sortOrder: lg.sortOrder,
        },
      });
    }
  }

  console.log("[taxonomy] Ensured", TAXONOMY_GEARS.length, "gears from taxonomy doc.");
}
