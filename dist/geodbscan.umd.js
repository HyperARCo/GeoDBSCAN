!function(t,s){"object"==typeof exports&&"undefined"!=typeof module?module.exports=s():"function"==typeof define&&define.amd?define(s):(t||self).geodbscan=s()}(this,function(){return function(){function t(){this._dataset=void 0,this._epsilon=void 0,this._minPts=void 0,this._clusters=void 0,this._noise=void 0,this._visited=void 0,this._assigned=void 0,this._datasetLength=0,this._dataset=[],this._epsilon=1,this._minPts=2,this._clusters=[],this._noise=[],this._visited=[],this._assigned=[],this._datasetLength=0}var s=t.prototype;return s.cluster=function(t,s){if(t){if(!(t instanceof Array))throw Error("Dataset must be of type array, "+typeof t+" given");this._dataset=t,this._clusters=[],this._noise=[],this._datasetLength=t.length,this._visited=new Array(this._datasetLength),this._assigned=new Array(this._datasetLength)}if(!s.minPts||"number"!=typeof s.minPts)throw Error("Minimum points must be defined and of type number (integer)");this._minPts=s.minPts,this._epsilon=s.epsilon?s.epsilon:this._getkNNDistPlotKnee(t,this._minPts);for(var e=0;e<this._datasetLength;e++)if(1!==this._visited[e]){this._visited[e]=1;var i=this._regionQuery(e);if(i.length<this._minPts)this._noise.push(e);else{var n=this._clusters.length;this._clusters.push([]),this._addToCluster(e,n),this._expandCluster(n,i)}}return this._clusters},s._kNNDistPlot=function(t,s){var e=this,i=[];return t.forEach(function(n,r){var h=[];t.forEach(function(t,s){r!==s&&h.push(e._haversineDistanceMeters(n,t))}),h.sort(function(t,s){return t-s}),i.push(h[s-1])}),i.sort(function(t,s){return s-t}),i},s._getkNNDistPlotKnee=function(t,s){var e=this._kNNDistPlot(t,s);if(console.log(e),t.length<3)throw new Error("Requires at least 3 data points to determine epsilon");if(3===t.length)return e[1];for(var i=0,n=0;n<e.length-1;n++)i+=e[n]-e[n+1];for(var r=i/e.length-1,h=[],o=0;o<e.length-1;o++)h.push(e[o]-e[o+1]>r);for(var a=Math.round(e.length/2),u=h.length,_=0;_<h.length-1;_++)if(h[_]||u--,u/h.length<3/4){a=_;break}return console.log(JSON.stringify(a)),e[a]},s._mergeArrays=function(t,s){for(var e=s.length,i=0;i<e;i++){var n=s[i];t.indexOf(n)<0&&t.push(n)}return t},s._haversineDistanceMeters=function(t,s){var e=function(t){return t*Math.PI/180},i=e(t[1]),n=e(t[0]),r=e(s[1]),h=r-i,o=e(s[0])-n,a=Math.sin(h/2)*Math.sin(h/2)+Math.cos(i)*Math.cos(r)*Math.sin(o/2)*Math.sin(o/2);return 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))*6371e3},s._regionQuery=function(t){for(var s=[],e=0;e<this._datasetLength;e++)this._haversineDistanceMeters(this._dataset[t],this._dataset[e])<this._epsilon&&s.push(e);return s},s._expandCluster=function(t,s){for(var e=0;e<s.length;e++){var i=s[e];if(1!==this._visited[i]){this._visited[i]=1;var n=this._regionQuery(i);n.length>=this._minPts&&(s=this._mergeArrays(s,n))}1!==this._assigned[i]&&this._addToCluster(i,t)}},s._addToCluster=function(t,s){this._clusters[s].push(t),this._assigned[t]=1},t}()});
//# sourceMappingURL=geodbscan.umd.js.map
