# 看见职校生｜2016—2026

这是“看见职校生”网站第一版静态原型，可直接用于 GitHub Pages。

## 文件结构

- `index.html`：首页
- `style.css`：全站样式
- `stories/index.html`：人物故事入口
- `stories/story-01.html`：第一个故事页面原型
- `images/.gitkeep`：以后放真实照片、海报等素材

## 上传到 GitHub

不要上传 ZIP 本身。先解压，然后把解压后的文件和文件夹上传到仓库根目录。

建议结构：

```text
index.html
style.css
README.md
images/
  .gitkeep
stories/
  index.html
  story-01.html
```

## 后续更新

网站骨架暂时保持稳定。以后新增人物故事时，可以复制：

`stories/story-01.html`

改名为：

`stories/story-02.html`

然后在 `stories/index.html` 增加一张卡片即可。

真实照片、旧海报、文章、视频等，可以逐步放进 `images/` 或建立新的档案页面。

## 设计原则

- 档案感 + 杂志感 + 青年感
- HOPE蓝 `#007CC3`
- HOPE黄 `#F8D308`
- HOPE绿 `#53A23C`
- 不依赖外部字体、图片或 JavaScript
- 手机和电脑均可浏览
- 不把“职校生”当成一个单一群体，而是从人的十年经历进入
