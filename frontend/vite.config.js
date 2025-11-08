import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			manifest: {
				name: "SplitEase",
				short_name: "SplitEase",
				description: "SplitEase - An easy way to split expenses",
				theme_color: "#4F46E5",
				background_color: "#ffffff",
				display: "standalone",
				scope: "/",
				start_url: "/",
				icons: [
					{
						src: "wallet.png",
						sizes: "192x192",
						type: "image/png",
					},
				],
			},
		}),
	],
});
