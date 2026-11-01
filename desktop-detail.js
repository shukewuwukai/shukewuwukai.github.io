'use strict';
(()=>{
 function activate(window){if(!window)return;document.querySelectorAll('.window.is-front').forEach(el=>el.classList.remove('is-front'));window.classList.add('is-front')}
 document.addEventListener('pointerdown',e=>activate(e.target.closest('.window')));
 document.addEventListener('focusin',e=>activate(e.target.closest('.window')));
 new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1&&node.matches('.floating-window'))activate(node)}).observe(document.getElementById('floating-windows'),{childList:true});
 activate(document.getElementById('daily-window'));
})();
