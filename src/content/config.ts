import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.string().url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              }),
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  loader: glob({ pattern: ["**/*.md", "**/*.mdx"], base: "src/data/post" }),
  schema: ({ image }) =>
    z.object({
      publishDate: z.coerce.date().optional(),
      date: z.coerce.date().optional(),
      updateDate: z.coerce.date().optional(),
      draft: z.boolean().optional(),

      title: z.string(),
      excerpt: z.string().optional(),
      // Acepta asset importado (image()) o cadena pública/URL.
      // Si es cadena debe ser absoluta (/img/...) o URL; para rutas relativas usar image() (asset).
      image: z
        .union([
          z
            .string()
            .refine(
              (s) => s.startsWith("/") || s.startsWith("http"),
              "Debe ser ruta absoluta o URL",
            ),
          image(),
        ])
        .optional(),

      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      author: z.string().optional(),

      metadata: metadataDefinition(),
    }),
});

export const collections = {
  post: postCollection,
  socio: defineCollection({
    loader: glob({ pattern: ["**/*.md", "**/*.mdx"], base: "src/data/socios" }),
    schema: ({ image }) =>
      z.object({
        publishDate: z.coerce.date().optional(),
        date: z.coerce.date().optional(),
        updateDate: z.coerce.date().optional(),
        draft: z.boolean().optional(),

        title: z.string(),
        excerpt: z.string().optional(),
        // Igual que en post: asset o cadena absoluta/URL
        image: z
          .union([
            z
              .string()
              .refine(
                (s) => s.startsWith("/") || s.startsWith("http"),
                "Debe ser ruta absoluta o URL",
              ),
            image(),
          ])
          .optional(),

        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        author: z.string().optional(),

        metadata: metadataDefinition(),
      }),
  }),
};
