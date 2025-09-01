import type { PaginateFunction } from "astro";
import { getCollection, render } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { Post } from "~/types";

import { cleanSlug, trimSlash } from "./permalinks";

// Configuración específica de SOCIOS
const SOCIOS_BASE = "socios"; // listado: /socios
const SOCIOS_CATEGORY_BASE = "socios/category"; // categorías: /socios/category/:slug
const SOCIOS_TAG_BASE = "socios/tag"; // tags: /socios/tag/:slug
const SOCIOS_POST_PERMALINK_PATTERN = `${SOCIOS_BASE}/%slug%`;
const SOCIOS_POSTS_PER_PAGE = 6;

const generatePermalink = async ({
  id,
  slug,
  publishDate,
  category,
}: {
  id: string;
  slug: string;
  publishDate: Date;
  category: string | undefined;
}) => {
  // Para socios usamos un patrón fijo bajo /socios/%slug%
  const permalink = SOCIOS_POST_PERMALINK_PATTERN.replace("%slug%", slug).replace(
    "%category%",
    category || "",
  );

  return permalink
    .split("/")
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join("/");
};

const getNormalizedPost = async (post: CollectionEntry<"socio">): Promise<Post> => {
  const { id, data } = post;
  const { Content, remarkPluginFrontmatter } = await render(post);

  const {
    publishDate: rawPublishDate = new Date(),
    updateDate: rawUpdateDate,
    title,
    excerpt,
    image,
    tags: rawTags = [],
    category: rawCategory,
    author,
    draft = false,
    metadata = {},
  } = data;

  const slug = cleanSlug(id);
  const publishDate = new Date(rawPublishDate);
  const updateDate = rawUpdateDate ? new Date(rawUpdateDate) : undefined;

  const category = rawCategory
    ? {
        slug: cleanSlug(rawCategory),
        title: rawCategory,
      }
    : undefined;

  const tags = rawTags.map((tag: string) => ({
    slug: cleanSlug(tag),
    title: tag,
  }));

  return {
    id: id,
    slug: slug,
    permalink: await generatePermalink({ id, slug, publishDate, category: category?.slug }),

    publishDate: publishDate,
    updateDate: updateDate,

    title: title,
    excerpt: excerpt,
    image: image,

    category: category,
    tags: tags,
    author: author,

    draft: draft,

    metadata,

    Content: Content,
    readingTime: remarkPluginFrontmatter?.readingTime,
  };
};

const load = async function (): Promise<Array<Post>> {
  const posts = await getCollection("socio");
  const normalizedPosts = posts.map(async (post) => await getNormalizedPost(post));

  const results = (await Promise.all(normalizedPosts))
    .sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf())
    .filter((post) => !post.draft);

  return results;
};

let _posts: Array<Post>;

export const sociosPostsPerPage = SOCIOS_POSTS_PER_PAGE;

export const fetchSociosPosts = async (): Promise<Array<Post>> => {
  if (!_posts) {
    _posts = await load();
  }
  return _posts;
};

export const getStaticPathsSociosList = async ({ paginate }: { paginate: PaginateFunction }) => {
  return paginate(await fetchSociosPosts(), {
    params: { socios: SOCIOS_BASE },
    pageSize: sociosPostsPerPage,
  });
};

export const getStaticPathsSociosPost = async () => {
  return (await fetchSociosPosts()).flatMap((post) => ({
    params: {
      socios: post.permalink,
    },
    props: { post },
  }));
};

export const getStaticPathsSociosCategory = async ({
  paginate,
}: {
  paginate: PaginateFunction;
}) => {
  const posts = await fetchSociosPosts();
  const categories: Record<string, { slug: string; title: string }> = {};
  posts.map((post) => {
    if (post.category?.slug) {
      categories[post.category?.slug] = post.category;
    }
  });

  return Array.from(Object.keys(categories)).flatMap((categorySlug) =>
    paginate(
      posts.filter((post) => post.category?.slug && categorySlug === post.category?.slug),
      {
        params: { category: categorySlug, socios: SOCIOS_CATEGORY_BASE },
        pageSize: sociosPostsPerPage,
        props: { category: categories[categorySlug] },
      },
    ),
  );
};

export const getStaticPathsSociosTag = async ({ paginate }: { paginate: PaginateFunction }) => {
  const posts = await fetchSociosPosts();
  const tags: Record<string, { slug: string; title: string }> = {};
  posts.map((post) => {
    if (Array.isArray(post.tags)) {
      post.tags.map((tag) => {
        tags[tag?.slug] = tag;
      });
    }
  });

  return Array.from(Object.keys(tags)).flatMap((tagSlug) =>
    paginate(
      posts.filter(
        (post) => Array.isArray(post.tags) && post.tags.find((elem) => elem.slug === tagSlug),
      ),
      {
        params: { tag: tagSlug, socios: SOCIOS_TAG_BASE },
        pageSize: sociosPostsPerPage,
        props: { tag: tags[tagSlug] },
      },
    ),
  );
};
