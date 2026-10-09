(() => {
"use strict";
const root=new URL("../",document.currentScript.src);
const list=document.querySelector("[data-content-category]");
const detail=document.querySelector("[data-content-detail]");
function el(tag,cls,value){const n=document.createElement(tag);if(cls)n.className=cls;if(value)n.textContent=value;return n;}
function local(path){if(typeof path!=="string"||!path||/^(?:[a-z]+:|\/\/)/i.test(path))return null;const url=new URL(path,root);return url.origin===root.origin&&url.pathname.startsWith(root.pathname)?url.href:null;}
function hasBody(item){return typeof item.body==="string"&&item.body.trim()||Array.isArray(item.chapters)&&item.chapters.length;}
function target(item){return hasBody(item)?new URL("materials/detail.html?id="+encodeURIComponent(item.id),root).href:local(item.url);}
function appendText(parent,text){
 String(text||"").split(/\n\s*\n/).filter(p=>p.trim()).forEach(block=>{
  const lines=block.trim().split("\n");let plain=[];
  function flush(){if(plain.length){parent.append(el("p","",plain.join("\n")));plain=[];}}
  lines.forEach(line=>{const h=line.match(/^(#{2,3})\s+(.+)$/);if(h){flush();parent.append(el(h[1].length===2?"h2":"h3","",h[2]));}else plain.push(line);});flush();
 });
}
fetch(new URL("data/content.json",root),{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("读取失败");return r.json();}).then(data=>{
 const items=data.items.filter(i=>i.published===true);
 if(list){
  const category=list.dataset.contentCategory;
  const candidates=items.filter(i=>category==="all"?hasBody(i):i.category===category);
  const buttons=document.querySelectorAll("[data-topic]");
  function render(topic=""){
   const fragment=document.createDocumentFragment();
   candidates.filter(i=>!topic||i.topic===topic).forEach((item,index)=>{
    const href=target(item);const card=el(href?"a":"article","record"+(href?"":" record-placeholder"));if(href)card.href=href;
    const cat=data.categories.find(c=>c.id===item.category);const meta=el("div","record-meta");
    meta.append(document.createTextNode(String(index+1).padStart(2,"0")),el("br"),document.createTextNode(item.topic||item.label||(category==="all"?cat?.title:item.date)||""));
    const body=el("div");body.append(el("h3","",item.title));
    const cover=local(item.cover);if(cover){const img=el("img","content-cover");img.src=cover;img.alt=item.coverAlt||item.title;img.loading="lazy";body.append(img);}
    if(item.summary)body.append(el("p","",item.summary));
    body.append(el("span","status",href?"阅读全文 →":item.status||"材料待整理"));
    card.append(meta,body);fragment.append(card);
   });
   if(!fragment.childNodes.length)fragment.append(el("p","list-state",topic?"这个方向暂时没有已发布文章。":"这里的文章将随着整理逐步加入。"));
   list.replaceChildren(fragment);
  }
  buttons.forEach(button=>button.addEventListener("click",()=>{buttons.forEach(b=>b.setAttribute("aria-pressed",String(b===button)));render(button.dataset.topic);}));
  render();
 }
 if(detail){
  const item=items.find(i=>i.id===new URLSearchParams(location.search).get("id"));
  if(!item||!hasBody(item)){document.querySelector("[data-title]").textContent="文章尚未发布";detail.textContent="这篇文章尚未发布，或链接不存在。";return;}
  document.title=item.title+"｜"+data.site.title;
  document.querySelector("[data-title]").textContent=item.title;
  const cat=data.categories.find(c=>c.id===item.category);
  const catLabel=document.querySelector("[data-article-category]");if(catLabel)catLabel.textContent=cat?.title||"十年记录";
  document.querySelectorAll("[data-category-back]").forEach(a=>{a.href=new URL((cat?.id||"archive")+"/",root).href;a.textContent="← 返回「"+(cat?.title||"十年档案")+"」";});
  const summary=document.querySelector("[data-summary]");summary.textContent=item.summary||"";summary.hidden=!item.summary;
  const meta=document.querySelector("[data-meta]");meta.textContent=[item.year,item.date,item.location,item.topic].filter(Boolean).join(" · ");meta.hidden=!meta.textContent;
  const fragment=document.createDocumentFragment();
  const cover=local(item.cover);if(cover){const img=el("img","content-cover article-cover");img.src=cover;img.alt=item.coverAlt||item.title;fragment.append(img);}
  if(typeof item.body==="string"&&item.body.trim())appendText(fragment,item.body);
  else(item.chapters||[]).forEach(chapter=>{
   if(chapter.title)fragment.append(el("h2","",chapter.title));
   (chapter.paragraphs||[]).forEach(p=>appendText(fragment,p));
   const image=local(chapter.image);if(image){const figure=el("figure");const img=el("img","content-cover");img.src=image;img.alt=chapter.caption||chapter.title||"";figure.append(img);if(chapter.caption)figure.append(el("figcaption","",chapter.caption));fragment.append(figure);}
  });
  if(item.attachments?.length){const section=el("section","related-materials");section.append(el("h2","","相关材料"));item.attachments.forEach(file=>{const href=local(file.path);if(href){const p=el("p");const a=el("a","",file.name);a.href=href;a.target="_blank";a.rel="noopener";p.append(a);section.append(p);}});fragment.append(section);}
  if(item.external&&/^https:\/\//i.test(item.external)){const p=el("p");const a=el("a","","查看视频或外部资料 →");a.href=item.external;a.target="_blank";a.rel="noopener noreferrer";p.append(a);fragment.append(p);}
  detail.replaceChildren(fragment);
 }
}).catch(()=>{if(list)list.textContent="暂时无法加载文章，请刷新重试。";if(detail)detail.textContent="暂时无法加载文章，请刷新重试。";});
})();