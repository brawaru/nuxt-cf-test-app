import { Driver } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";

export interface CachedOptions {
  driver: Driver;
}

export default function cached(options: CachedOptions): Driver {
  const { driver } = options;
  const memory = memoryDriver() as Driver;
  return {
    ...driver,
    name: driver.name ? `cached:${driver.name}` : `cached`,
    options,
    async hasItem(key, opts) {
      console.log(`[cache] hasItem`, { key, opts });
      return (await memory.hasItem(key, {})) || (await driver.hasItem(key, {}));
    },
    async getItem(key, opts) {
      console.log("[cache] getItem", { key, opts });
      const memoryLookup = await memory.getItem(key);
      if (memoryLookup !== null) {
        console.log(`[cache] getItem: cache hit`, { key });
        return memoryLookup;
      }

      console.log(`[cache] getItem: cache miss`, { key });
      const lookup = await driver.getItem(key);

      memory.setItem!(key, lookup as any, {});

      return lookup;
    },
    async setItem(key, value, opts) {
      console.log(`[cache] setItem`, { key, value, opts });
      memory.setItem!(key, value, {});
      await driver.setItem?.(key, value, {});
    },
  };
}
