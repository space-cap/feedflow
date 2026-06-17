import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        mist: "#eef3ef",
        leaf: "#1f7a4d",
        coral: "#df6b4f"
      }
    }
  },
  plugins: []
};

export default config;
