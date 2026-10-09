import {decode64,makeItem,mergeItem,commitFiles} from "./core.js";
const $=id=>document.getElementById(id);
const base="https://api.github.com/repos/zcl52500-arch/youth-from-vocational-schools";
let token="",data=null,selected=null,baseline=null,busy=false,dirty=false;
function message(text){$("message").textContent=text;}
async function api(path,method="GET",body){
 const response=await fetch(base+path,{method,cache:"no-store",headers:{Authorization:"Bearer "+token,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28",...(body?{"Content-Type":"application/json"}:{})},...(body?{body:JSON.stringify(body)}:{})});
 if(!response.ok){let reason="";try{reason=(await response.json()).message||"";}catch{}
 throw new Error(response.status===401?"授权码无效或已过期，请重新连接。":response.status===403?"无法保存：请检查授权码是否具有此仓库的 Contents 读写权限，或稍后重试。":response.status===422||response.status===409?"保存遇到冲突；材料仍在表单中，请稍后再试。":"请求失败（"+response.status+"）"+reason);}
 return response.status===204?null:response.json();
}
async function snapshot(){const ref=await api("/git/ref/heads/main");const file=await api("/contents/data/content.json?ref="+ref.object.sha);return {head:ref.object.sha,data:JSON.parse(decode64(file.content))};}
function renderList(){
 $("records").replaceChildren();
 data.items.forEach(item=>{const b=document.createElement("button");b.type="button";b.textContent=(item.published?"已发布 · ":"草稿 · ")+item.title;b.onclick=()=>{if(dirty&&!confirm("有尚未保存的修改，确定切换材料吗？"))return;open(item);};$("records").append(b);});
}
function updateTopics(value=""){
 const topics=data.categories.find(c=>c.id===$("category").value)?.topics||[];
 $("topic").replaceChildren();const blank=document.createElement("option");blank.value="";blank.textContent="不指定方向";$("topic").append(blank);
 topics.forEach(t=>{const o=document.createElement("option");o.value=t;o.textContent=t;$("topic").append(o);});$("topic").value=value;$("topic-field").hidden=!topics.length;
}
$("category").addEventListener("change",()=>updateTopics());
function open(item=null){
 selected=item?.id||null;baseline=item?structuredClone(item):null;
 $("editor").reset();
 for(const field of ["category","title","summary","date","label","external"])$(field).value=item?.[field]|| (field==="category"?"explorations":"");
 updateTopics(item?.topic||"");
 $("body").value=item?.body??(item?.chapters||[]).map(ch=>[ch.title,...(ch.paragraphs||[])].filter(Boolean).join("\n\n")).join("\n\n");
 $("existing-cover").textContent=item?.cover?"已有封面："+item.cover:"";
 $("preview-content").hidden=true;renderAttachments();dirty=false;
}
function renderAttachments(){
 $("attachments").replaceChildren();
 (baseline?.attachments||[]).forEach((file,index)=>{const p=document.createElement("p");p.textContent=file.name;const b=document.createElement("button");b.type="button";b.textContent="移除链接";b.onclick=()=>{baseline.attachments.splice(index,1);dirty=true;renderAttachments();};p.append(b);$("attachments").append(p);});
}
$("connect").onclick=async()=>{
 token=$("token").value.trim();if(!token){message("请先填写授权码。");return;}
 $("connect").disabled=true;
 try{const repo=await api("");if(!repo.permissions?.push)throw new Error("此账号没有仓库写入权限。");
 const snapshotData=await snapshot();data=snapshotData.data;
 $("category").replaceChildren();data.categories.forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=c.title;$("category").append(o);});
 $("token").value="";$("connection").hidden=true;$("workspace").hidden=false;$("logout").hidden=false;renderList();open();message("已连接。可以新增材料，也可以选择已有材料修改。");
 }catch(e){token="";message(e.message);}finally{$("connect").disabled=false;}
};
$("logout").onclick=()=>{if(busy)return;if(dirty&&!confirm("有尚未保存的修改，确定断开吗？"))return;token="";data=null;baseline=null;selected=null;dirty=false;$("editor").reset();$("workspace").hidden=true;$("logout").hidden=true;$("connection").hidden=false;message("已断开连接。");};
$("new").onclick=()=>{if(dirty&&!confirm("有尚未保存的修改，确定新建吗？"))return;open();message("填写新材料。");};
$("editor").addEventListener("input",()=>{dirty=true;});
$("preview").onclick=()=>{
 const area=$("preview-content");area.replaceChildren();const h=document.createElement("h2");h.textContent=$("title").value;area.append(h);
 if($("summary").value){const p=document.createElement("p");p.textContent=$("summary").value;area.append(p);}
 $("body").value.split(/\n\s*\n/).filter(Boolean).forEach(block=>{let plain=[];function flush(){if(plain.length){const p=document.createElement("p");p.textContent=plain.join("\n");p.style.whiteSpace="pre-line";area.append(p);plain=[];}}block.split("\n").forEach(line=>{const heading=line.match(/^(#{2,3})\s+(.+)$/);if(heading){flush();const h=document.createElement(heading[1].length===2?"h2":"h3");h.textContent=heading[2];area.append(h);}else plain.push(line);});flush();});area.hidden=false;
};
async function upload(file){
 if(file.size>10*1024*1024)throw new Error("单个文件不能超过 10 MB："+file.name);
 const extension=file.name.split(".").pop().toLowerCase();
 if(!["png","jpg","jpeg","webp","gif","pdf","doc","docx","xls","xlsx","ppt","pptx","txt","csv","zip"].includes(extension))throw new Error("暂不支持这个文件格式："+file.name);
 const content=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(",")[1]);reader.onerror=()=>reject(new Error("无法读取文件"));reader.readAsDataURL(file);});
 const blob=await api("/git/blobs","POST",{content,encoding:"base64"});
 return {path:"uploads/"+crypto.randomUUID()+"."+extension,mode:"100644",type:"blob",sha:blob.sha};
}
$("editor").onsubmit=async event=>{
 event.preventDefault();if(busy||!token)return;
 const published=event.submitter?.id==="publish";
 if(!$("title").value.trim()){message("请填写标题。");return;}
 if(published&&!$("body").value.trim()){message("发布前请填写正文。");return;}
 const external=$("external").value.trim();
 if(external&&!/^https:\/\//i.test(external)){message("外部链接请使用 https:// 开头的地址。");return;}
 const incoming=[...$("files").files,...$("cover").files];
 if(incoming.some(f=>f.size>10*1024*1024)){message("单个文件最多 10 MB，请压缩后再选。");return;}
 busy=true;document.querySelectorAll("button,input,select,textarea").forEach(e=>e.disabled=true);message("正在保存，请保持页面打开……");
 try{
 const original=selected?data.items.find(x=>x.id===selected):{};
 const id=selected||crypto.randomUUID();
 const fields=Object.fromEntries(["category","topic","title","summary","date","label","body","external"].map(f=>[f,$(f).value]));
 const item=makeItem(original,fields,id,published);
 const oldBody=original.body??(original.chapters||[]).map(ch=>[ch.title,...(ch.paragraphs||[])].filter(Boolean).join("\n\n")).join("\n\n");
 if(fields.body===oldBody)item.chapters=structuredClone(original.chapters||[]);item.attachments=structuredClone(baseline?.attachments||[]);
 const latest=await snapshot();
 let merged=mergeItem(latest.data,item,selected?original:null);
 const entries=[];
 const cover=$("cover").files[0];
 if(cover){if(!/^image\/(png|jpeg|webp|gif)$/.test(cover.type))throw new Error("封面请选择 PNG、JPEG、WebP 或 GIF 图片。");const entry=await upload(cover);entries.push(entry);item.cover=entry.path;item.coverAlt=item.title;}
 for(const file of $("files").files){const entry=await upload(file);entries.push(entry);item.attachments.push({name:file.name,path:entry.path});}
 merged={...merged,items:merged.items.map(x=>x.id===id?item:x)};
 entries.push({path:"data/content.json",mode:"100644",type:"blob",content:JSON.stringify(merged,null,2)+"\n"});
 await commitFiles(api,latest.head,entries,(published?"Publish material: ":"Save draft: ")+item.title);
 data=merged;renderList();open(item);message(published?"已保存并提交发布。网站更新通常需要几分钟。可从首页或所属栏目查看材料。":"草稿已保存到仓库，不会出现在网站列表中。");
 }catch(e){message(e.message+"\n当前填写内容仍保留，请修正后重试。");}
 finally{busy=false;document.querySelectorAll("button,input,select,textarea").forEach(e=>e.disabled=false);}
};
window.addEventListener("beforeunload",e=>{if(dirty||busy){e.preventDefault();e.returnValue="";}});
