import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mr. Faaja",
    short_name: "Mr. Faaja",
    description: "ServiceNow Developer. Problem solver. Always learning.",
    start_url: "/",
    display: "browser",
    background_color: "#000000",
    theme_color: "#081426",
    icons: [
      { src: "/icon.png", sizes: "256x256", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
