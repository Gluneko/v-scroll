# v-scroll 原生组件笔试实现

零依赖 Web Components 方案，提供真实滚动容器与自定义滚动条外观，支持拖拽映射、尺寸探测与主题 CSS 切换。

## 本地开发

```bash
bun i
bun run dev
```

未安装 bun 时可回退到 npm：

```bash
npm install
npm run dev
```

## 构建验证

```bash
./build.sh
```

## 题目要求对应

- 使用 `customElements.define("v-scroll", ...)` 注册组件。
- 采用真实 `overflow:auto` 滚动容器并隐藏系统滚动条。
- 自定义滚动条结构位于组件内部，并通过 `part` 暴露外部样式控制点。
- 使用 `ResizeObserver` 动态判定溢出与滑块高度（最小 16px）。
- 使用 Pointer Events + Pointer Capture 实现拖拽交互与映射。
- 在 `disconnectedCallback` 中统一销毁监听与观察器。
- 使用 Vite 插件 `configResolved` 将 `src/v-scroll.css` 压缩并输出 `public/theme/v-scroll.js`。
- 页面通过 `importmap` 提供 `$/` 映射，支持主题路径替换。

## 关于 CSS 注入方式的说明

题目提示「`import CSS` 后往 `document.head` 注入 style」。本实现里：

- 光标变量（`--svgScroll` / `--svgGrab`）确实注入到 `document.head`（全局 `:root` 变量），见 `ensureGlobalStyle()`。
- 组件外观 CSS（含 `:host` / `.bar` 等 Shadow DOM 内选择器）通过 `adoptedStyleSheets` 应用到 shadow root —— 因为 `:host`、`.bar` 这类选择器注入 `document.head` 不会作用到 Shadow DOM 内部。

两种方式都满足核心诉求「改 importmap 即可切换主题」：CSS 被打包成 `export default '...'` 的 JS 模块，通过 importmap 的 `$/` 映射导入，更换 importmap 指向的主题目录即可换肤，组件代码零改动。

选择 `adoptedStyleSheets` 还有额外收益：多个 `<v-scroll>` 实例可共享同一份 `CSSStyleSheet`（见 `SHARED_SHEET`），比每个实例克隆 `<style>` 更省内存；同时保留了在不支持该 API 时回退到 shadow root 内 `<style>` 的兼容分支。

## 部署建议

### GitHub Pages

1. 推送仓库到 GitHub。
2. 在仓库设置中启用 Pages（`GitHub Actions` 或 `docs` 目录方式）。
3. 使用构建产物 `dist` 作为静态站点内容部署。
4. 生成在线地址后，填写到提交信息中。

### Cloudflare Pages

1. 连接 GitHub 仓库并创建 Pages 项目。
2. 构建命令填写 `./build.sh`。
3. 输出目录填写 `dist`。
4. 完成后获取可访问预览地址并提交。

## 提交清单

- 仓库 URL：https://github.com/Gluneko/v-scroll
- 在线预览 URL：https://gluneko.github.io/v-scroll/
