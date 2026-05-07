import type { Config } from "tailwindcss";

const config: Config = {
  // Tailwind CSS v4 不再使用 content 字段，會自動掃描所有檔案
  // theme.extend 仍然支援，用於自訂顏色、間距等
  theme: {
    extend: {},
  },
};

export default config;