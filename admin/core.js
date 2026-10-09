export function decode64(value){return new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g,"")),c=>c.charCodeAt(0)));}
export function makeItem(original,fields,id,published){
 return {...original,id,category:fields.category,title:fields.title.trim(),summary:fields.summary.trim(),date:fields.date,label:fields.label.trim(),published,url:"",status:published?"阅读材料 →":"草稿",body:fields.body,topic:fields.topic||"",chapters:original.body===undefined&&original.chapters?original.chapters:[],external:fields.external.trim(),attachments:original.attachments||[]};
}
export function mergeItem(data,item,baseline){
 const current=data.items.find(x=>x.id===item.id);
 if(JSON.stringify(current??null)!==JSON.stringify(baseline??null)) throw new Error("这条材料已在其他页面被修改。请重新连接并打开最新材料；当前正文仍在表单中。");
 return {...data,items:current?data.items.map(x=>x.id===item.id?item:x):[...data.items,item]};
}
export async function commitFiles(api,head,entries,message){
 const parent=await api("/git/commits/"+head);
 const tree=await api("/git/trees","POST",{base_tree:parent.tree.sha,tree:entries});
 const commit=await api("/git/commits","POST",{message,tree:tree.sha,parents:[head]});
 await api("/git/refs/heads/main","PATCH",{sha:commit.sha,force:false});
 return commit.sha;
}
