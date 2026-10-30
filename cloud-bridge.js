(()=>{
 'use strict';
 const base=window.SIDEB_CLOUD?.apiBase,originalFetch=window.fetch.bind(window),sessionKey='sideb-cloud-session',previews=new Map();
 const validId=id=>typeof id==='string'&&/^[a-f0-9-]{36}$/.test(id);
 const apiURL=path=>base+path;
 function resolveCover(value){return typeof value==='string'&&/^\/api\/covers\/[a-f0-9-]{36}$/.test(value)?cover(value.split('/').pop()):value}
 function isCover(value){if(!base||typeof value!=='string')return false;try{const url=new URL(value),api=new URL(base);return url.origin===api.origin&&new RegExp('^'+api.pathname+'/api/covers/[a-f0-9-]{36}$').test(url.pathname)}catch{return false}}
 function cover(id){if(!validId(id))return '/asset-link-record.svg';return previews.get(id)||apiURL('/api/covers/'+id)}
 window.SideBCloud={cover,resolveCover,isCover};
 if(!base){console.warn('SIDE B cloud endpoint has not been configured.');return}
 window.fetch=async(input,options={})=>{
  const requested=new Request(input instanceof Request?input:new URL(input,location.href),options),url=new URL(requested.url);
  if(url.origin!==location.origin||!url.pathname.startsWith('/api/'))return originalFetch(input,options);
  const headers=new Headers(requested.headers),token=localStorage.getItem(sessionKey);if(token)headers.set('X-Sideb-Session',token);
  const response=await originalFetch(apiURL(url.pathname+url.search),{method:requested.method,headers,body:['GET','HEAD'].includes(requested.method)?undefined:await requested.arrayBuffer(),credentials:'omit',signal:requested.signal,cache:'no-store'});
  const next=response.headers.get('X-Sideb-Session');if(next==='signedout')localStorage.removeItem(sessionKey);else if(next)localStorage.setItem(sessionKey,next);
  if(response.ok&&response.headers.get('Content-Type')?.includes('application/json')){
   const data=await response.clone().json();if(validId(data.id)&&data.url)previews.set(data.id,data.url);if(validId(data.track?.coverId)&&data.track.coverUrl)previews.set(data.track.coverId,data.track.coverUrl);
  }
  return response;
 };
 // Public covers load directly. An unpublished draft cover is refreshed with its owner's session.
 document.addEventListener('error',async event=>{const image=event.target;if(!(image instanceof HTMLImageElement)||!isCover(image.src)||image.dataset.cloudRetry===image.src)return;const id=new URL(image.src).pathname.split('/').pop();image.dataset.cloudRetry=image.src;try{const response=await window.fetch('/api/cover-grants?ids='+id);if(!response.ok)return;const data=await response.json();if(data.covers?.[id]){previews.set(id,data.covers[id]);image.src=data.covers[id];}}catch{}},true);
})();
