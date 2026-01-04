import { z } from "@hono/zod-openapi";

/**
 * Agora IDs
 * - lowercase
 * - a–z, 0–9, -, _
 */
export const AGORA_ID_REGEX = /^[a-z0-9_-]+$/;

export const AgoraIdSchema = z
  .string()
  .min(1)
  .regex(AGORA_ID_REGEX, {
    message: "Allowed characters: a-z, 0-9, - and _",
  })

export type AgoraId = z.infer<typeof AgoraIdSchema>;

/**
 * Space IDs
 * Currently fixed set: space00–space05
 */
export const VALID_SPACE_IDS = [
  "space00",
  "space01",
  "space02",
  "space03",
  "space04",
  "space05",
] as const;

export const SpaceIdSchema = z.enum(VALID_SPACE_IDS)

export type SpaceId = typeof VALID_SPACE_IDS[number];
