import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { fileURLToPath, URL } from 'node:url';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const pathSrc = fileURLToPath(new URL('./src', import.meta.url));
  // 仅生产构建生效的开关：下面的 esbuild.drop 只用于生产压缩，开发环境不受影响
  const isProd = mode === 'production';

  return {
    base: '/',
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', "vue-router", "@vueuse/core"],
        resolvers: [ElementPlusResolver(), IconsResolver({ prefix: "Icon" })],
        eslintrc: {
          enabled: true,
          filepath: "./.eslintrc-auto-import.json",
          globalsPropValue: true,
        },
        dts: false
      }),
      Components({
        resolvers: [ElementPlusResolver(), IconsResolver({ enabledCollections: ["ep"] })]
      }),
      Icons({
        autoInstall: true,
      }),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [resolve(pathSrc, "assets/icons")],
        // 指定symbolId格式
        symbolId: "icon-[dir]-[name]",
      }),
    ],
    resolve: {
      extensions: [".js", ".vue", ".json"],
      alias: {
        '@': pathSrc 
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true,
          additionalData: "@use '@/styles/variables.scss';",
        }
      }
    },
    server: {
      port: env.VITE_APP_PORT || 3000,
      open: true,
      cors: true,
      proxy: {
        // 保留 /api 前缀：后端所有路由（含 JWT 白名单 /api/login、/api/register）都挂在 /api 下
        '/api': {
          target: 'http://localhost:3008',
          changeOrigin: true
        },
        // 上传文件的静态访问路径（后端 express.static 托管，无鉴权）
        '/uploads': {
          target: 'http://localhost:3008',
          changeOrigin: true
        },
        // WebSocket：必须开 ws:true 才会代理 Upgrade 握手，否则前端连 /ws 会打到 Vite 自身
        '/ws': {
          target: 'ws://localhost:3008',
          ws: true,
          changeOrigin: true
        }
      }
    },
    // 生产构建压缩：使用 Vite 内置的 esbuild（默认压缩器），并保留原本由 terser 承担的
    // 「剔除 console / debugger」效果。esbuild 配置只在生产注入，开发环境照常保留 console 便于调试。
    esbuild: isProd ? { drop: ['console', 'debugger'] } : {},
    build: {
      chunkSizeWarningLimit: 2000, // 消除打包大小超过500kb警告
      // ⚠ 暂时屏蔽 terser 压缩（原配置如下）。
      // 原因：terser 自 Vite 3 起是**可选依赖**，本项目 devDependencies 未安装，
      //       导致 `npm run build` 在压缩阶段直接失败（vite:terser terser not found）。
      // 现改用 Vite 默认的 esbuild 压缩，构建可正常完成；功能完全等价，
      // 且原有的 drop_console / drop_debugger 已由上面的 esbuild.drop 等价实现。
      // 体积影响：esbuild 的压缩率通常略弱于 terser，但本项目无基线可比（terser 从未成功构建过）。
      //           实测本次产物主 chunk 1236.44 kB，剔除 console/debugger 仅省下约 0.36 kB
      //           （源码只有 1 处 console 调用，其余是第三方库的值引用，esbuild 不会动）。
      // 另：原 keep_infinity 无需等价项 —— esbuild 不会把 Infinity 压成 1/0（那是 terser 特有的 compress 优化），
      //     且本项目源码未使用 Infinity。
      // 如需恢复 terser：先执行 `npm i -D terser`，再解开下面注释并删掉上面的 esbuild 配置。
      // minify: "terser", // Vite 2.6.x 以上需要配置 minify: "terser", terserOptions 才能生效
      // terserOptions: {
      //   compress: {
      //     keep_infinity: true, // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
      //     drop_console: true, // 生产环境去除 console
      //     drop_debugger: true, // 生产环境去除 debugger
      //   },
      //   format: {
      //     comments: false, // 删除注释
      //   },
      // },
      rollupOptions: {
        output: {
          // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
          entryFileNames: "js/[name].[hash].js",
          // 用于命名代码拆分时创建的共享块的输出命名
          chunkFileNames: "js/[name].[hash].js",
          // 用于输出静态资源的命名，[ext]表示文件扩展名
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split(".");
            let extType = info[info.length - 1];
            // console.log('文件信息', assetInfo.name)
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
              extType = "media";
            } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
              extType = "img";
            } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              extType = "fonts";
            }
            return `${extType}/[name].[hash].[ext]`;
          },
        },
      },
    },
  };
});
