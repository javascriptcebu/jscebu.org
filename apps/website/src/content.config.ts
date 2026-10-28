import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { linkSchema, organizerSchema, pageSchema, projectSchema } from './content/schemas';

export const collections = {
  projects: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/projects' }), schema: projectSchema }),
  organizers: defineCollection({ loader: file('src/content/organizers.json'), schema: organizerSchema }),
  links: defineCollection({ loader: file('src/content/links.json'), schema: linkSchema }),
  pages: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/pages' }), schema: pageSchema }),
};
