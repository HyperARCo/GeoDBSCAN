export default class{constructor(){this._dataset=void 0,this._epsilon=void 0,this._minPts=void 0,this._clusters=void 0,this._noise=void 0,this._visited=void 0,this._assigned=void 0,this._datasetLength=0,this._dataset=[],this._epsilon=1,this._minPts=2,this._clusters=[],this._noise=[],this._visited=[],this._assigned=[],this._datasetLength=0}cluster(t,s){if(t){if(!(t instanceof Array))throw Error("Dataset must be of type array, "+typeof t+" given");this._dataset=t,this._clusters=[],this._noise=[],this._datasetLength=t.length,this._visited=new Array(this._datasetLength),this._assigned=new Array(this._datasetLength)}if(!s.minPts||"number"!=typeof s.minPts)throw Error("Minimum points must be defined and of type number (integer)");this._minPts=s.minPts,this._epsilon=s.epsilon?s.epsilon:this._getkNNDistPlotKnee(t,this._minPts);for(let t=0;t<this._datasetLength;t++)if(1!==this._visited[t]){this._visited[t]=1;const s=this._regionQuery(t);if(s.length<this._minPts)this._noise.push(t);else{const e=this._clusters.length;this._clusters.push([]),this._addToCluster(t,e),this._expandCluster(e,s)}}return this._clusters}_kNNDistPlot(t,s){const e=[];return t.forEach((i,n)=>{const h=[];t.forEach((t,s)=>{n!==s&&h.push(this._haversineDistanceMeters(i,t))}),h.sort((t,s)=>t-s),e.push(h[s-1])}),e.sort((t,s)=>s-t),e}_getkNNDistPlotKnee(t,s){const e=this._kNNDistPlot(t,s);if(console.log(e),t.length<3)throw new Error("Requires at least 3 data points to determine epsilon");if(3===t.length)return e[1];let i=0;for(let t=0;t<e.length-1;t++)i+=e[t]-e[t+1];const n=i/e.length-1,h=[];for(let t=0;t<e.length-1;t++)h.push(e[t]-e[t+1]>n);let r=Math.round(e.length/2),o=h.length;for(let t=0;t<h.length-1;t++)if(h[t]||o--,o/h.length<3/4){r=t;break}return console.log(JSON.stringify(r)),e[r]}_mergeArrays(t,s){const e=s.length;for(let i=0;i<e;i++){const e=s[i];t.indexOf(e)<0&&t.push(e)}return t}_haversineDistanceMeters(t,s){const e=t=>t*Math.PI/180,i=e(t[1]),n=e(t[0]),h=e(s[1]),r=h-i,o=e(s[0])-n,a=Math.sin(r/2)*Math.sin(r/2)+Math.cos(i)*Math.cos(h)*Math.sin(o/2)*Math.sin(o/2);return 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))*6371e3}_regionQuery(t){const s=[];for(let e=0;e<this._datasetLength;e++)this._haversineDistanceMeters(this._dataset[t],this._dataset[e])<this._epsilon&&s.push(e);return s}_expandCluster(t,s){for(let e=0;e<s.length;e++){const i=s[e];if(1!==this._visited[i]){this._visited[i]=1;const t=this._regionQuery(i);t.length>=this._minPts&&(s=this._mergeArrays(s,t))}1!==this._assigned[i]&&this._addToCluster(i,t)}}_addToCluster(t,s){this._clusters[s].push(t),this._assigned[t]=1}}
//# sourceMappingURL=geodbscan.modern.js.map
