import type { StorageMounts } from "nitropack";

// https://nuxt.com/docs/api/configuration/nuxt-config
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** Cloudflare KV via binding: name of the binding. */
      CF_KV_BINDING_CACHE?: string;

      /** Vercel KV: token. */
      KV_REST_API_TOKEN?: string;
      /** Vercel KV: API URL. */
      KV_REST_API_URL?: string;
      /**
       * Vercel KV: base name for cache KV.
       * @default 'cache'
       */
      VERCEL_KV_CACHE_BASE?: string;

      /** Cache storage option. */
      CACHE_STORAGE_OPTION?: string;
    }
  }
}

/**
 * Checks that all environment variables are defined.
 * @param vars Variables to check.
 * @returns All missing variables.
 */
function getMissingVars(vars: string[]) {
  return vars.filter((varName) => !process.env[varName]);
}

/**
 * Returns Nitro storage mounts or nothing.
 */
export function getCacheStorageMount(): StorageMounts[string] | undefined {
  switch (process.env.CACHE_STORAGE_OPTION) {
    case "cloudflare-kv": {
      if (process.env.CF_KV_BINDING_CACHE) {
        return {
          driver: "~/server/storage/cached-cloudflare-kv-binding",
          binding: process.env.CF_KV_BINDING_CACHE,
        };
      }

      console.warn(
        "You wanted to use `cloudflare-kv` cache store option, however you have not provided `CF_KV_BINDING_CACHE` environment variable. The cache will use in-memory storage that is not persistent in workers."
      );

      break;
    }
    case "vercel-kv": {
      const missingVars = getMissingVars([
        "KV_REST_API_TOKEN",
        "KV_REST_API_URL",
      ]);

      if (!missingVars.length) {
        return {
          driver: "~/server/storage/cached-vercel-kv",
          base: process.env.VERCEL_KV_CACHE_BASE || "cache",
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN,
          env: false,
        };
      }

      console.log(
        `You wanted to use \`vercel-kv\` cache store option, however you have not provided ${missingVars
          .map((varName) => `\`${varName}\``)
          .join(
            ", "
          )} environment variable. The cache will use in-memory storage taht is not persistent in serverless functions.`
      );

      break;
    }
  }

  return undefined;
}

export function getStorageMounts(): StorageMounts | undefined {
  let mounts: StorageMounts | undefined;

  const cacheMount = getCacheStorageMount();
  if (cacheMount != null) (mounts ??= {}).cache = cacheMount;

  return mounts;
}
