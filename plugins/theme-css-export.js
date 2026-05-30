import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { transform } from "lightningcss";

const PLUGIN_NAME = "theme-css-export";

export default ({
  source_file = "src/v-scroll.css",
  out_file = "public/theme/v-scroll.js"
} = {}) => ({
  name: PLUGIN_NAME,
  async configResolved(config) {
    const root_dir = config.root ?? process.cwd();
    const src_path = resolve(root_dir, source_file);
    const out_path = resolve(root_dir, out_file);
    const css_raw = await readFile(src_path, "utf8");
    const { code } = transform({
      filename: src_path,
      code: Buffer.from(css_raw),
      minify: true,
      drafts: { nesting: true }
    });

    const js_module = `export default ${JSON.stringify(code.toString())};\n`;
    await mkdir(dirname(out_path), { recursive: true });
    await writeFile(out_path, js_module, "utf8");
  }
});
