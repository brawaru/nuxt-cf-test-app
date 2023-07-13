import { getStorageMounts } from "./config/storages";

const tsConfig = {
  compilerOptions: {
    moduleResolution: "bundler",
    allowImportingTsExtensions: true,
    noEmit: true,
  },
};

export default defineNuxtConfig({
  devtools: { enabled: true },
  nitro: {
    storage: getStorageMounts(),
    typescript: {
      strict: true,
      tsConfig,
    },
  },
  typescript: {
    shim: false,
    strict: true,
    typeCheck: true,
    tsConfig,
  },
});
