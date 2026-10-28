import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

/** Takes Astro's schema context so `image()` resolves local images; tests pass a stand-in. */
export const projectSchema = ({ image }: Pick<SchemaContext, 'image'>) =>
  z.object({
    name: z.string(),
    url: z.string().url(),
    repo: z.string().url().optional(),
    summary: z.string(),
    image: image(),
    status: z.enum(['active', 'archived']),
    featured: z.boolean(),
    order: z.number(),
  });

export const organizerSchema = ({ image }: Pick<SchemaContext, 'image'>) =>
  z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    community: z.string().optional(),
    /** Their own site. */
    url: z.string().url().optional(),
    /** A real photo (or the avatar they publish), square, relative to organizers.json. */
    photo: image().optional(),
    order: z.number(),
  });

export const linkSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string(),
  handle: z.string().optional(),
  order: z.number(),
});

export const pageSchema = z.object({
  title: z.string(),
  description: z.string(),
});
