# 新增探索记录

列表和详情页共用 data/content.json，不需要再改首页或栏目页面。

1. 打开 data/item-template.json，复制整个对象。
2. 打开 data/content.json，把对象加进 items 数组；与前一条记录之间用英文逗号分隔。
3. 填写 id（唯一的英文短名）、label、title、summary 和五个 chapters。每段文字是 paragraphs 数组中的一个字符串。
4. 图片上传到 images，cover 或章节 image 填写 images/文件名.jpg。空字符串表示没有图片。
5. 真实内容准备好后，将 published 从 false 改为 true 并提交。

新记录会自动出现在“我们做过的探索”，点击可阅读详情。published 为 false 的草稿不显示。列表顺序与 items 顺序一致。year、date、location 均可留空；不确定的信息不要补写。日期可填写 YYYY-MM-DD。

已有独立 HTML 页面可以填写 url（从仓库根目录起的相对路径）。使用自动详情页时省略 url，填写 chapters 即可。不要将 url 指向尚不存在的页面。文件路径区分大小写。

标题和正文均为纯文字，不填写 HTML。段落中的双引号写成 \\"，换段用两个独立字符串。提交前确认 GitHub 编辑器没有 JSON 格式错误。

现有五条探索主题保留原文和整理状态，成长小组仍链接到既有结构示例。页面保留原静态列表作为加载失败或关闭 JavaScript 时的后备内容；新增记录的自动显示需要 JavaScript。

其他六个栏目保持现有内容，后续可以逐栏接入同一索引。
