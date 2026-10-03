(() => {
"use strict";
const root = new URL("../", document.currentScript.src);
const list = document.querySelector("[data-content-category]");
const detail = document.querySelector("[data-content-detail]");
function el(tag, cls, value) {
 const node = document.createElement(tag);
 if (cls) node.className = cls;
 if (value) node.textContent = value;
 return node;
}
function local(path) {
 if (typeof path !== "string" || !path || /^(?:[a-z]+:|\/\/)/i.test(path)) return null;
 const url = new URL(path, root);
 return url.origin === root.origin && url.pathname.startsWith(root.pathname) ? url.href : null;
}
function target(item) {
 return local(item.url) || (Array.isArray(item.chapters) && item.chapters.length ? new URL("explorations/detail.html?id=" + encodeURIComponent(item.id), root).href : null);
}
fetch(new URL("data/content.json", root)).then(response => {
 if (!response.ok) throw new Error("资料读取失败");
 return response.json();
}).then(data => {
 if (!Array.isArray(data.items)) throw new Error("资料格式有误");
 const items = data.items.filter(item => item.published === true);
 if (list) {
  const fragment = document.createDocumentFragment();
  items.filter(item => item.category === list.dataset.contentCategory).forEach((item, index) => {
   const href = target(item);
   const card = el(href ? "a" : "article", "record exploration-record" + (href ? "" : " record-placeholder"));
   if (href) card.href = href;
   const meta = el("div", "record-meta");
   meta.append(document.createTextNode(String(index + 1).padStart(2, "0")), el("br"), document.createTextNode(item.label || item.year || ""));
   const body = el("div");
   body.append(el("h3", "", item.title));
   if (item.question) body.append(el("p", "exploration-question", item.question));
   const cover = local(item.cover);
   if (cover) { const image = el("img", "content-cover"); image.src = cover; image.alt = item.coverAlt || item.title; image.loading = "lazy"; body.append(image); }
   body.append(el("p", "", item.summary), el("span", "status", item.status || (href ? "阅读探索记录 →" : "材料待整理")));
   card.append(meta, body); fragment.append(card);
  });
  if (fragment.childNodes.length) list.replaceChildren(fragment);
 }
 if (detail) {
  const item = items.find(item => item.id === new URLSearchParams(location.search).get("id") && item.category === "explorations");
  if (!item || !Array.isArray(item.chapters) || !item.chapters.length) { detail.textContent = "这份记录尚未发布。"; return; }
  document.title = item.title + "｜看见职校生";
  document.querySelector("[data-title]").textContent = item.title;
  document.querySelector("[data-summary]").textContent = item.summary || "";
  document.querySelector("[data-meta]").textContent = [item.year, item.date, item.location].filter(Boolean).join(" · ");
  const fragment = document.createDocumentFragment();
  item.chapters.forEach((chapter, index) => {
   const section = el("section", "case-chapter");
   section.append(el("span", "chapter-tag", String(index + 1).padStart(2, "0") + " · " + chapter.label), el("h2", "", chapter.title));
   (chapter.paragraphs || []).forEach(paragraph => section.append(el("p", "", paragraph)));
   const imagePath = local(chapter.image);
   if (imagePath) { const figure = el("figure"); const image = el("img", "content-cover"); image.src = imagePath; image.alt = chapter.caption || chapter.title; figure.append(image); if(chapter.caption) figure.append(el("figcaption", "", chapter.caption)); section.append(figure); }
   fragment.append(section);
  });
  detail.replaceChildren(fragment);
 }
}).catch(error => {
 console.error(error);
 if (detail) detail.textContent = "暂时无法加载资料，请稍后刷新。";
});
})();