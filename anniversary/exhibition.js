(() => {
  "use strict";
  const root = new URL("../", document.currentScript.src);
  const exhibitionUrl = new URL("anniversary/data/exhibition.json", root);
  const contentUrl = new URL("data/content.json", root);
  const timeline = document.getElementById("exhibition-timeline");
  const featured = document.getElementById("featured-list");

  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function safeLocal(path) {
    if (typeof path !== "string" || !path || /^(?:[a-z]+:|\/\/)/i.test(path)) return null;
    const url = new URL(path, root);
    return url.origin === root.origin && url.pathname.startsWith(root.pathname) ? url.href : null;
  }
  function articleUrl(item) {
    if (item.body?.trim() || (Array.isArray(item.chapters) && item.chapters.length)) {
      return new URL("materials/detail.html?id=" + encodeURIComponent(item.id), root).href;
    }
    const local = safeLocal(item.url);
    return local;
  }
  function renderTimeline(points, items) {
    if (!timeline) return;
    const fragment = document.createDocumentFragment();
    points.forEach(point => {
      const article = node("article", "timeline-stop");
      article.append(node("time", "", point.year), node("h3", "", point.title), node("p", "", point.description));
      const item = items.find(candidate => candidate.id === point.itemId && candidate.published === true);
      const href = item ? articleUrl(item) : safeLocal(point.href);
      if (href) {
        const link = node("a", "", point.linkLabel || "查看相关记录 ↗");
        link.href = href;
        article.append(link);
      }
      fragment.append(article);
    });
    timeline.replaceChildren(fragment);
  }
  function renderFeatured(items, ids) {
    if (!featured) return;
    const published = items.filter(item => item.published === true);
    const selected = ids.length ? ids.map(id => published.find(item => item.id === id)).filter(Boolean) : published.slice(0, 4);
    const fragment = document.createDocumentFragment();
    if (!selected.length) {
      fragment.append(node("p", "loading-note", "公开档案正在持续整理，新的内容将陆续加入。"));
      featured.replaceChildren(fragment);
      return;
    }
    selected.forEach(item => {
      const href = articleUrl(item);
      const card = node(href ? "a" : "article", "featured-item");
      if (href) card.href = href;
      const meta = node("div", "item-meta", [item.date, item.label || item.topic || "十年记录"].filter(Boolean).join(" · "));
      const body = node("div");
      body.append(node("h3", "", item.title), node("p", "", item.summary || ""));
      card.append(meta, body, node("span", "item-arrow", href ? "↗" : "·"));
      fragment.append(card);
    });
    featured.replaceChildren(fragment);
  }
  Promise.all([
    fetch(exhibitionUrl, { cache: "no-cache" }).then(response => { if (!response.ok) throw new Error("展览配置读取失败"); return response.json(); }),
    fetch(contentUrl, { cache: "no-cache" }).then(response => { if (!response.ok) throw new Error("内容库读取失败"); return response.json(); })
  ]).then(([exhibition, content]) => {
    renderTimeline(exhibition.timeline || [], content.items || []);
    renderFeatured(content.items || [], exhibition.featuredItemIds || []);
  }).catch(() => {
    if (timeline) timeline.textContent = "暂时无法加载展览内容，请稍后刷新。";
    if (featured) featured.textContent = "暂时无法读取档案内容，请稍后刷新。";
  });
})();
