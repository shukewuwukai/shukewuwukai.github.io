(function(root){
  'use strict';
  const providers={netease:'NetEase Music',qq:'QQ Music',apple:'Apple Music'};
  function parse(input){
    const text=String(input||'').trim();
    const match=text.match(/https?:\/\/[^\s<>"“”]+/i);
    if(!match) return {error:'Paste an Apple Music, NetEase or QQ Music share link.'};
    let url; try{url=new URL(match[0].replace(/[，。；、）)]+$/,''));}catch{return {error:'Link not recognized. Copy it again.'};}
    const host=url.hostname.toLowerCase();
    if(!['music.163.com','y.music.163.com','m.music.163.com','music.apple.com','y.qq.com','i.y.qq.com','c.y.qq.com','c6.y.qq.com'].includes(host))return {error:'Apple Music, NetEase and QQ Music links are supported.'};
    if(url.protocol!=='https:'&&url.protocol!=='http:'||url.username||url.password||url.port) return {error:'Use a standard music-platform share link.'};
    if(host==='music.apple.com'){
      if(url.protocol!=='https:')return {error:'Use an HTTPS Apple Music link.'};
      const route=url.pathname.match(/^\/([a-z]{2})\/(song|album)\/(?:[^/]+\/)?(\d{1,16})\/?$/i);
      const id=route&&(route[2]==='album'?url.searchParams.get('i'):route[3]);
      if(!route||!/^\d{1,16}$/.test(id||'')||!Number.isSafeInteger(Number(id)))return {error:'Use an Apple Music single-song share link.'};
      const country=route[1].toLowerCase();return {provider:'apple',type:'song',id,country,key:`apple:song:${country}:${id}`,label:providers.apple,kind:'Track',sourceUrl:`https://music.apple.com/${country}/song/${id}`,embedUrl:`https://embed.music.apple.com/${country}/song/${id}`};
    }
    if(['c.y.qq.com','c6.y.qq.com'].includes(host))return {error:'Open the short link first, then copy the full track-page URL.'};
    if(host.endsWith('163.com')){
      let path=url.pathname,params=url.searchParams;
      if(url.hash.startsWith('#/')){let part=new URL(url.hash.slice(1),'https://music.163.com');path=part.pathname;params=part.searchParams;}
      path=path.replace(/^\/[mf]\//,'/');
      const route=path.match(/^\/(song|playlist|album)(?:\/(\d+))?\/?$/);
      const id=route&&(route[2]||params.get('id'));
      if(!route||!/^\d{1,20}$/.test(id||''))return {error:'Copy a NetEase track, playlist or album page link.'};
      const type=route[1],code={song:2,playlist:0,album:1}[type];
      return {provider:'netease',type,id,key:`netease:${type}:${id}`,label:providers.netease,kind:{song:'Track',playlist:'Playlist',album:'Album'}[type],sourceUrl:`https://music.163.com/#/${type}?id=${id}`,embedUrl:`https://music.163.com/outchain/player?type=${code}&id=${id}&auto=0&height=${type==='song'?66:430}`};
    }
    const numericPath=url.pathname.match(/^\/n\/(?:ryqq_v2|ryqq|yqq)\/(?:songDetail|song)\/(\d+)(?:\.html)?\/?$/);
    const id=url.searchParams.get('songid')||url.searchParams.get('songId')||url.searchParams.get('id')||numericPath?.[1];
    const mid=url.searchParams.get('songmid')||url.searchParams.get('songMid')||url.pathname.match(/\/(?:songDetail|song)\/([a-zA-Z0-9]+)(?:\.html)?\/?$/)?.[1];
    if(!/^\d{1,20}$/.test(id||''))return {error:mid?'This QQ link uses songmid. Use a track link with a numeric songid.':'QQ tracks require a songid. QQ playlists cannot be embedded.'};
    if(!numericPath&&!['/v8/playsong.html','/n/ryqq/songDetail','/n/yqq/song','/n2/m/outchain/player/index.html'].includes(url.pathname))return {error:'Use a QQ Music track share link.'};
    return {provider:'qq',type:'song',id,key:`qq:song:${id}`,label:providers.qq,kind:'Track',sourceUrl:`https://i.y.qq.com/v8/playsong.html?songid=${id}&songtype=0`,embedUrl:`https://i.y.qq.com/n2/m/outchain/player/index.html?songid=${id}&songtype=0`};
  }
  function sourceFor(track){return track&&track.source?parse(track.source):null;}
  root.DaytonePreview={parse,sourceFor,example:'https://i.y.qq.com/v8/playsong.html?songid=127570280&songtype=0'};
})(typeof window!=='undefined'?window:globalThis);
