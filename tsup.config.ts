import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/main.ts", "./src/tracing.ts"],
  outDir: ".output",
  format: "esm",
  target: "esnext",
  sourcemap: true,
  clean: true,
  bundle: true,
  treeshake: true,
  // noExternal: [/^@<our-app>\/.*/],
  minify: false,
  keepNames: true,
  banner: {
    js: [
      `import { createRequire } from 'module';`,
      // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
      `const require = createRequire(import.meta.url);`,
    ].join("\n"),
  },
  esbuildOptions: (options) => {
    options.legalComments = "none";
    options.platform = "node";
  },
});
