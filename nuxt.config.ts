import { getStorageMounts } from "./config/storages";

export default defineNuxtConfig({
  devtools: { enabled: true },
  nitro: { storage: getStorageMounts() },
});
