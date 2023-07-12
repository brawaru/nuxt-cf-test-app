import vercelStorage, { VercelKVOptions } from 'unstorage/drivers/vercel-kv'
import memoryStorage from 'unstorage/drivers/memory'
import { Driver } from 'unstorage'

export default function cachedVercelKV(opts: VercelKVOptions): Driver {
  const memory = memoryStorage() as Driver
  const driver = vercelStorage(opts) as Driver
  return {
    ...driver,
    async hasItem(key, opts) {
      return (await memory.hasItem(key, opts)) || (await driver.hasItem(key, opts))
    },
    async getItem(key) {
      const memoryLookup = await memory.getItem(key)
      if (memoryLookup !== null) return memoryLookup

      const lookup = await driver.getItem(key)
      memory.setItem(key, lookup as any)
      return lookup
    },
    async setItem(key, value) {
      memory.setItem(key, value)
      await driver.setItem(key, value)
    },
  }
}
