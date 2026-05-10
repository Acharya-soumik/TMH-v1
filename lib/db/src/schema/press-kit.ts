/**
 * Press kit assets — branded social-media images + AI captions generated
 * by the CMS press-kit module from any platform content.
 *
 * One row per (content_type, content_id, template, size) combination.
 * Captions are stored alongside the image so re-generation is independent.
 */

import { pgTable, serial, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const pressKitAssetsTable = pgTable(
  "press_kit_assets",
  {
    id: serial("id").primaryKey(),
    contentType: text("content_type").notNull(),
    contentId: integer("content_id").notNull(),
    template: text("template").notNull(),
    size: text("size").notNull(),
    r2Key: text("r2_key").notNull(),
    captionX: text("caption_x"),
    captionIg: text("caption_ig"),
    captionLi: text("caption_li"),
    generatedByUser: text("generated_by_user"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("press_kit_unique").on(t.contentType, t.contentId, t.template, t.size),
  ],
);

export type PressKitAsset = typeof pressKitAssetsTable.$inferSelect;
