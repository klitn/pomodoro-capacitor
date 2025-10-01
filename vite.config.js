import react from "@vitejs/plugin-react"

export default function myDefineConfig({ command }) {
  const config = {
    plugins: [react()],
    root: ".",
    build: {
      outDir: "dist",
    },
  }

  if (command !== "serve") {
    config.base = "/"
  }

  return config
}
