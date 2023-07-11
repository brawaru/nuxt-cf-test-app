import type { StorageMounts } from "nitropack";

// https://nuxt.com/docs/api/configuration/nuxt-config
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NITRO_PRESET?: string;
      /** Cloudflare KV via binding: name of the binding. */
      CF_KV_BINDING_CACHE?: string;

      /** Cloudflare KV over REST: account ID. */
      CF_KV_REST_ACCOUNT_ID?: string;
      /** Cloudflare KV over REST: namespace ID for cache. */
      CF_KV_REST_CACHE_NSID?: string;
      /** Cloudflare KV over REST: token. */
      CF_KV_REST_API_TOKEN?: string;

      /** Vercel KV: token. */
      KV_REST_API_TOKEN?: string;
      /** Vercel KV: API URL. */
      KV_REST_API_URL?: string;
      /**
       * Vercel KV: base name for cache KV.
       * @default 'cache'
       */
      VERCEL_KV_CACHE_BASE?: string;
    }
  }
}

export function getNitroStorages(): StorageMounts | undefined {
  switch (process.env.NITRO_PRESET) {
    case "cloudflare":
    case "cloudflare-module":
    case "cloudflare-pages":
      if (process.env.CF_KV_BINDING_CACHE) {
        return {
          cache: {
            driver: "cloudflare-kv-binding",
            binding: process.env.CF_KV_BINDING_CACHE,
          },
        };
      }

      console.warn(
        "You are building Nuxt with Cloudflare Worker Nitro preset, however you have not provided `CF_KV_BINDING_CACHE` environment variable. The cache will use in-memory storage that is not persistent in workers."
      );

      break;
    // case "cloudflare-pages":
    //   if (
    //     process.env.CF_KV_REST_ACCOUNT_ID &&
    //     process.env.CF_KV_REST_API_TOKEN &&
    //     process.env.CF_KV_REST_CACHE_NSID
    //   ) {
    //     return {
    //       cache: {
    //         driver: "cloudflare-kv-http",
    //         accountId: process.env.CF_KV_REST_ACCOUNT_ID,
    //         namespaceId: process.env.CF_KV_REST_CACHE_NSID,
    //         apiToken: process.env.CF_KV_REST_API_TOKEN,
    //       },
    //     };
    //   }

    //   const missingVarsList = (() => {
    //     const expectedVars: (keyof NodeJS.ProcessEnv)[] = [
    //       "CF_KV_REST_ACCOUNT_ID",
    //       "CF_KV_REST_CACHE_NSID",
    //       "CF_KV_REST_API_TOKEN",
    //     ];

    //     const missingVars: string[] = [];

    //     for (const expectedVar of expectedVars) {
    //       if (!process.env[expectedVar]) missingVars.push(`\`${expectedVar}\``);
    //     }

    //     return missingVars.join(", ");
    //   })();

    //   console.warn(
    //     `You are building Nuxt with Cloudflare Pages Nitro preset, however you have not provided ${missingVarsList} environment variable(s). The cache will use in-memory storage that is not persistent in functions.`
    //   );

    //   break;
    case "vercel":
    case "vercel-edge":
      if (process.env.KV_REST_API_TOKEN && process.env.KV_REST_API_URL) {
        return {
          cache: {
            driver: "vercel-kv",
            base: process.env.VERCEL_KV_CACHE_BASE || "cache",
          },
        };
      }
      break;
  }

  console.log(
    `Using in-memory storage for provider ${process.env.NITRO_PRESET}`
  );

  return undefined; // in-memory
}

export default defineNuxtConfig({
  devtools: { enabled: true },
  nitro: { storage: getNitroStorages() },
});
