# eRLT — Project Website

论文 **eRLT: Efficient VLA Reinforcement Learning via Action-Relevant Token Routing** 的展示网站。

论文：[arXiv:2610.00913](https://arxiv.org/abs/2610.00913)

白底与墨绿色的纯静态页面，无需构建、安装依赖或配置服务端。设计参考 [FALCON](https://falcon-vla.github.io/)。作者、单位角标及项目负责人标记与 arXiv 正式版本一致。

## 推送到 GitHub

此文件所在目录已经是独立 Git 仓库，初始提交已包含运行网站所需的文件，使用 Codex 署名，没有修改全局 Git 身份设置。原始论文材料和大体积原始录像保留在本地 `resources/`，已被 `.gitignore` 排除。

1. 在 GitHub 创建一个空仓库，例如 `erlt`；创建时无需添加 README、License 或 `.gitignore`。
2. 在本目录执行以下命令，将 `YOUR_USERNAME` 和 `YOUR_REPOSITORY` 替换为实际值：

```sh
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin HEAD:main
```

本地工作分支为 `codex/github-pages`；以上命令将当前内容推送到远程 `main`。以后更新页面，提交后执行 `git push origin HEAD:main` 即可。

## 开启 GitHub Pages

在 GitHub 仓库的 **Settings → Pages → Build and deployment** 中设置：

- **Source**：Deploy from a branch
- **Branch**：main
- **Folder**：/(root)

点击 **Save**。发布完成后，普通项目仓库的网址为 `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`；若仓库名为 `YOUR_USERNAME.github.io`，则网址为 `https://YOUR_USERNAME.github.io/`。

所有站内资源均使用相对路径，两种地址形式均可使用。根目录的 `.nojekyll` 让 Pages 直接发布静态文件，无需额外 workflow。

参考：[GitHub Pages 官方发布说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 本地预览

安装 Node.js 后，在项目目录执行：

```sh
npm run dev
```

打开 <http://127.0.0.1:4173/>。预览服务支持视频分段请求。也可使用其他静态网站服务器。

## 文件说明

| 文件 | 用途 |
| --- | --- |
| `index.html` | 作者与单位、正文、图表和引用 |
| `styles.css` | 桌面与手机布局、墨绿色主题 |
| `app.js` | 实验切换、整组播放、图片放大、引用复制 |
| `assets/images/` | 网页实际使用的四张论文插图 |
| `assets/media/` | 15 段网页 MP4 视频及对应封面 |
| `citation.bib` | 与网页一致的完整 BibTeX |
| `preview.mjs` | 本地预览服务器 |
| `scripts/prepare_media.py` | 可选：从本地原始录像重新生成网页视频 |

网页视频已准备好，发布时不需要运行转码脚本。视频、封面和论文插图合计约 55 MB，单个文件最大约 14 MB，直接随 Git 提交，无需 Git LFS。

作者与单位信息来自 [arXiv 论文首页](https://arxiv.org/pdf/2610.00913)。Paper 按钮指向 arXiv 正式页面。代码仓库入口将在有正式链接后补充。
