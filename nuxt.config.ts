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

      /**
       * Cache storage option.
       * @default '<computed based on NITRO_PRESET>'
       */
      CACHE_STORAGE_OPTION?: string;
    }
  }
}

function getNitroStorageOption() {
  const option = process.env.CACHE_STORAGE_OPTION;
  if (option) return option;

  switch (process.env.NITRO_PRESET) {
    case "cloudflare":
    case "cloudflare-module":
    case "cloudflare-pages":
      return "cloudflare-kv";
    case "vercel":
    case "vercel-edge":
      return "vercel-kv";
  }

  return null;
}

function getMissingVars(vars: string[]) {
  const missing = [];
  for (const varName of vars) {
    if (!process.env[varName]) missing.push(varName);
  }
  return missing;
}

function getNitroStorages(): StorageMounts | undefined {
  switch (getNitroStorageOption()) {
    case "cloudflare-kv": {
      if (process.env.CF_KV_BINDING_CACHE) {
        return {
          cache: {
            driver: "cloudflare-kv-binding",
            binding: process.env.CF_KV_BINDING_CACHE,
          },
        };
      }

      console.warn(
        "You wanted to use `cloudflare-kv` cache store option, however you have not provided `CF_KV_BINDING_CACHE` environment variable. The cache will use in-memory storage that is not persistent in workers."
      );

      break;
    }
    case "cloudflare-kv-http": {
      const missingVars = getMissingVars([
        "CF_KV_REST_ACCOUNT_ID",
        "CF_KV_REST_CACHE_NSID",
        "CF_KV_REST_API_TOKEN",
      ]);

      if (!missingVars.length) {
        return {
          cache: {
            driver: "cloudflare-kv-http",
            accountId: process.env.CF_KV_REST_ACCOUNT_ID,
            namespaceId: process.env.CF_KV_REST_CACHE_NSID,
            apiToken: process.env.CF_KV_REST_API_TOKEN,
          },
        };
      }

      console.warn(
        `You wanted to use \`cloudflare-kv-http\` cache store option, however you have not provided ${missingVars
          .map((varName) => `\`${varName}\``)
          .join(
            ", "
          )} environment variable(s). The cache will use in-memory storage that is not persistent in functions.`
      );

      break;
    }
    case "vercel-kv":
      const missingVars = getMissingVars([
        "KV_REST_API_TOKEN",
        "KV_REST_API_URL",
      ]);

      if (!missingVars.length) {
        return {
          cache: {
            driver: "vercel-kv",
            base: process.env.VERCEL_KV_CACHE_BASE || "cache",
          },
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

  return undefined; // in-memory
}

export default defineNuxtConfig({
  devtools: { enabled: true },
  nitro: { storage: getNitroStorages() },
});
