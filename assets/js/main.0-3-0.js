!function e(t,r,n){function i(c,a){if(!r[c]){if(!t[c]){var s="function"==typeof require&&require;if(!a&&s)return s(c,!0);if(o)return o(c,!0);var u=new Error("Cannot find module '"+c+"'");throw u.code="MODULE_NOT_FOUND",u}var d=r[c]={exports:{}};t[c][0].call(d.exports,function(e){var r=t[c][1][e];return i(r?r:e)},d,d.exports,e,t,r,n)}return r[c].exports}for(var o="function"==typeof require&&require,c=0;c<n.length;c++)i(n[c]);return i}({1:[function(e,t,r){"use strict";function n(e,t){var r={wrap:e},n=!1,u=!1,d=0,h={};if(!(r.wrap instanceof HTMLDivElement))throw new Error("invalid container");if("string"!=typeof t)throw new Error("invalid template");if(r.list=r.wrap.querySelector(".trackers-list"),r.add=r.wrap.querySelector(".trackers-button--add"),r.remAll=r.wrap.querySelector(".trackers-button--rem-all"),r["delete"]=r.wrap.querySelector(".trackers-button--delete"),r.cancelDel=r.wrap.querySelector(".trackers-button--cancel-del"),r.merge=r.wrap.querySelector(".trackers-button--merge"),r.mergeSel=r.wrap.querySelector(".trackers-button--merge-sel"),r.cancelMerge=r.wrap.querySelector(".trackers-button--cancel-merge"),r.total=r.wrap.querySelector(".trackers-total"),!p)throw new Error("localStorage not available");s(this,{trackers:{get:function(){return h}},trackersSize:{get:function(){return Object.keys(h).length}},minified:{get:function(){return Object.keys(h).reduce(function(e,t){return e.concat([h[t].minified])},[])}},mergeMode:{get:function(){return u},set:function(e){if("boolean"==typeof e){if(e&&0===this.trackersSize||u===e)return;n&&e&&(n=!1),u=e,o.call(this,r)}}},deleteMode:{get:function(){return n},set:function(e){if("boolean"==typeof e){if(e&&0===this.trackersSize||n===e)return;u&&e&&(u=!1),n=e,o.call(this,r)}}}}),this.add=function(e,n){var o,c=d++;return n="boolean"==typeof n?n:!0,e=h[c]=e instanceof f?e:new f,o=l(t,{tracked:e.format(),description:e.description,tracking:e.tracking,id:c}),r.list.insertBefore(o,r.list.firstChild),a.apply(this,[e,c,{container:o,tracked:o.querySelector(".tracker-tracked"),description:o.querySelector(".tracker-description"),toggle:o.querySelector(".tracker-toggle"),merge:o.querySelector(".tracker-merge"),remove:o.querySelector(".tracker-remove")}]),this.deleteMode=!1,this.mergeMode=!1,n&&(i.call(this,r),this.store()),this},this.remove=function(e,t){return t="boolean"==typeof t?t:!0,h.hasOwnProperty(e)&&(delete h[e],r.list.removeChild(document.getElementById("tracker-"+e)),t&&(i.call(this,r),this.store())),this},this["new"]=function(){var e=d;this.add(),h[e].start(),document.getElementById("tracker-"+e).querySelector(".tracker-description").focus()}.bind(this),this.updateTotal=function(){r.total.innerHTML=f.format(Object.keys(h).reduce(function(e,t){var r=h[t];return e+=r.trackedTotal},0))},c.call(this,r)}function i(e){0===this.trackersSize?(e.total.className+=" inactive",e["delete"].parentNode.className+=" inactive",this.deleteMode=!1):(d(e.total,"inactive"),d(e["delete"].parentNode,"inactive")),this.trackersSize<=1?(e.merge.parentNode.className+=" inactive",this.mergeMode=!1):d(e.merge.parentNode,"inactive"),this.updateTotal()}function o(e){var t=e.list.querySelectorAll("input, textarea"),r=!this.mergeMode&&!this.deleteMode;d(e.wrap,"trackers-(merge|delete)-mode","$3"),this.mergeMode&&(e.wrap.className+=" trackers-merge-mode"),this.deleteMode&&(e.wrap.className+=" trackers-delete-mode"),Object.keys(t).forEach(function(e){t[e].readOnly=!r})}function c(e){e.add.addEventListener("click",function(){this["new"]()}.bind(this)),e.remAll.addEventListener("click",this.removeAll.bind(this)),e["delete"].addEventListener("click",function(){this.deleteMode=!this.deleteMode}.bind(this)),e.cancelDel.addEventListener("click",function(){this.deleteMode=!1}.bind(this)),e.mergeSel.addEventListener("click",this.mergeSelected.bind(this)),e.merge.addEventListener("click",function(){this.mergeMode=!this.mergeMode}.bind(this)),e.cancelMerge.addEventListener("click",function(){this.mergeMode=!1}.bind(this))}function a(e,t,r){function n(){d(r.container,"tracker--(not-)?tracking","$3"),r.container.className+=" tracker--"+(e.tracking?"":"not-")+"tracking"}function i(){a&&clearInterval(a),a=window.setInterval(function(){(r.tracked!==document.activeElement||this.mergeMode||this.deleteMode)&&(r.tracked.value=e.format()),this.updateTotal()}.bind(this),1e3)}function o(){clearInterval(a)}function c(){r.description.style.height="auto",r.description.style.height=r.description.scrollHeight+"px"}var a;return u(r.description,function(){this.mergeMode||this.deleteMode||(e.description=r.description.value,c(),this.store())}.bind(this)),r.tracked.addEventListener("focus",function(){r.tracked.dataset.prevValue=r.tracked.value}),u(r.tracked,function(){this.mergeMode||this.deleteMode||f.format(f.anyToDuration(r.tracked.value))!==r.tracked.dataset.prevValue&&(e.tracked=f.stringToDuration(r.tracked.value),e.tracking&&(e.trackingSince=f.now()),this.updateTotal(),this.store())}.bind(this)),r.tracked.addEventListener("blur",function(){r.tracked.value=e.format()}),r.toggle.addEventListener("click",function(){e.toggle(),this.store()}.bind(this)),r.remove.addEventListener("click",function(){this.remove(t)}.bind(this)),r.merge.addEventListener("click",function(){r.container.className+=" tracker-merge-select"}),e.on("start",function(){Object.keys(this.trackers).forEach(function(t){this.trackers[t]!==e&&this.trackers[t].stop()}.bind(this)),i.call(this),n(),c()}.bind(this)),e.on("stop",function(){o(),n(),c()}),e.tracking&&i.call(this),c(),this}var s=e("functions/define-properties"),u=e("functions/on-value-update"),d=e("functions/remove-class"),l=e("functions/render-template"),f=e("classes/tracker"),p=window.localStorage;n.prototype.store=function(){try{p.setItem("trackers",JSON.stringify(this.minified))}catch(e){throw new Error("could not store trackers")}return this},n.prototype.restore=function(){var e;try{Object.keys(this.trackers).forEach(function(e){this.remove(e)}.bind(this)),e=JSON.parse(p.getItem("trackers"))||[],e.forEach(function(t,r){t.unshift(null),this.add(new(Function.prototype.bind.apply(f,t)),e.length-1===r)}.bind(this))}catch(t){throw new Error("could not restore trackers")}return this},n.prototype.removeAll=function(){return Object.keys(this.trackers).forEach(function(e){this.remove(e,1===this.trackersSize)}.bind(this)),this.deleteMode=!1,this},n.prototype.mergeSelected=function(){return this},t.exports=n},{"classes/tracker":2,"functions/define-properties":3,"functions/on-value-update":5,"functions/remove-class":6,"functions/render-template":7}],2:[function(e,t,r){"use strict";function n(e,t,r){var o={tracked:0,tracking:!1,description:""},c={};i(this,{tracked:{get:function(){return o.tracked},set:function(e){"undefined"!=typeof e&&(o.tracked=n.durationToNumber(n.anyToDuration(e)))}},trackedTotal:{get:function(){return this.tracking?o.tracked+n.now()-o.tracking:this.tracked}},tracking:{get:function(){return o.tracking!==!1},set:function(e){"boolean"==typeof e?(o.tracked=this.trackedTotal,e?o.tracking=n.now():o.tracking=!1):"undefined"!=typeof e&&(o.tracking=n.now()-n.durationToNumber(n.anyToDuration()))}},trackingSince:{get:function(){return this.tracking?o.tracking:void 0},set:function(e){"undefined"!=typeof e&&(e=parseInt(e,10),isNaN(e)||(o.tracking=e))}},description:{get:function(){return o.description},set:function(e){"string"==typeof e&&(e=e.trim()).length>0&&(o.description=e)}},minified:{get:function(){return[o.tracked,o.tracking,o.description]}}}),this.merge=function(e){return e instanceof n&&(o.tracked+=n.durationToNumber(e.trackedTotal),o.description+="\n"+e.descroption),this},this.on=function(e,t){"function"==typeof t&&(c[e]=t)},this.trigger=function(e){c.hasOwnProperty(e)&&c[e]()},this.tracked=e,this.trackingSince=t,this.description=r}var i=e("functions/define-properties");n.prototype.start=function(){return this.tracking=!0,this.trigger("start"),this},n.prototype.stop=function(){return this.tracking=!1,this.trigger("stop"),this},n.prototype.toggle=function(){this.tracking?this.stop():this.start()},n.prototype.format=function(e){return n.format(n.numberToDuration(this.trackedTotal),e)},n.now=function(){return(new Date).getTime()},n.numberToDuration=function(e){return{h:Math.floor(e/36e5),m:Math.floor(e/6e4%60),s:Math.floor(e/1e3%60),ms:Math.floor(e%1e3)}},n.stringToDuration=function(e){return n.arrayToDuration(("string"==typeof e?e:e.toString()||"").replace(/[^0-9:]/g,"").split(":"))},n.arrayToDuration=function(e){return["h","m","s","ms"].reduce(function(t,r,n){var i=parseInt(e[n],10);return t[r]=isNaN(i)?0:i,t},{})},n.durationToNumber=function(e){var t=0;return e.hasOwnProperty("h")&&(t+=60*parseInt(e.h,10)*60*1e3),e.hasOwnProperty("m")&&(t+=60*parseInt(e.m,10)*1e3),e.hasOwnProperty("s")&&(t+=1e3*parseInt(e.s,10)),e.hasOwnProperty("ms")&&(t+=parseInt(e.ms,10)),t},n.anyToDuration=function(e){if("number"==typeof e&&!isNaN(e))return n.numberToDuration(e);if(Array.isArray(e))return n.arrayToDuration(e);if("string"==typeof e)return n.stringToDuration(e);if("object"==typeof e)return n.numberToDuration(n.durationToNumber(e));throw new Error("unexpected duration type: "+typeof e)},n.format=function(e,t){return t="string"==typeof t?t:"%h:%m:%s",e="undefined"!=typeof e?n.anyToDuration(e):0,Object.keys(e).reverse().reduce(function(t,r){return t.replace(new RegExp("%"+r,"ig"),("0"+e[r]).slice(-2))},t)},t.exports=n},{"functions/define-properties":3}],3:[function(e,t,r){"use strict";function n(e,t,r){if("object"!=typeof e)throw new Error("no valid object to add properties");if("object"!=typeof t)throw new Error("no valid definitions object");r="object"==typeof r?r:{get:i,set:i,enumerable:!0},Object.defineProperties(e,Object.keys(t).reduce(function(e,n){return e[n]=Object.keys(r).reduce(function(e,t){return e.hasOwnProperty(t)||(e[t]=r[t]),e},t[n]),e},{}))}function i(){}t.exports=n,t.exports.noop=i},{}],4:[function(e,t,r){"use strict";function n(e){"loading"!==document.readyState?e():document.addEventListener("DOMContentLoaded",e)}t.exports=n},{}],5:[function(e,t,r){"use strict";function n(e,t){function r(e){window.setTimeout(function(){t(e)},0)}e.addEventListener("change",t),e.addEventListener("cut",r),e.addEventListener("paste",r),e.addEventListener("drop",r),e.addEventListener("keydown",r)}t.exports=n},{}],6:[function(e,t,r){"use strict";function n(e,t,r){var n=new RegExp("(^| )"+t+"( |$)","ig");r=r||"$2",e&&e.className&&(e.className=e.className.replace(n,r))}t.exports=n},{}],7:[function(e,t,r){"use strict";function n(e,t){var r=document.implementation.createHTMLDocument(),n=i[e]=i[e]||new Function("obj","var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"+e.replace(/[\r\t\n]/g," ").split("{%").join("	").replace(/((^|%\})[^\t]*)"/g,"$1\r").replace(/\t=(.*?)%\}/g,"',$1,'").split("	").join("');").split("%}").join("p.push('").split("\r").join('"')+'\');}return p.join("");');return t="object"==typeof t?t:{},r.body.innerHTML=n(t),r.body.children.length>1?r.body.children:r.body.children[0]}var i={};t.exports=n},{}],8:[function(e,t,r){"use strict";var n,i=e("functions/on-dom-ready"),o=e("classes/tracker-collection");i(function(){n=new o(document.getElementById("trackers"),document.getElementById("tracker-template").innerHTML),n.restore()})},{"classes/tracker-collection":1,"functions/on-dom-ready":4}]},{},[8]);
//# sourceMappingURL=main.0-3-0.js.map