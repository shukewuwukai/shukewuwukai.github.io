(function(root){
 'use strict';
 function read(saved,day){return {draftDay:day,draft:saved.draftDay===day&&Array.isArray(saved.draft)?saved.draft.slice(0,3):[],note:saved.draftDay===day?String(saved.note||''):''}}
 function rollover(state,day){if(state.draftDay===day)return false;Object.assign(state,read({},day),{newCover:null,resolvedImport:null,importing:false});return true}
 root.SideBDraft={read,rollover};
})(typeof window!=='undefined'?window:globalThis);
