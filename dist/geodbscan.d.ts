export default class GeoDBSCAN {
    private _dataset;
    private _epsilon;
    private _minPts;
    private _clusters;
    private _noise;
    private _visited;
    private _assigned;
    private _datasetLength;
    constructor();
    cluster(dataset: [number, number][], options: {
        minPts: number;
        epsilon?: number;
    }): number[][];
    private _kNNDistPlot;
    private _getkNNDistPlotKnee;
    private _mergeArrays;
    private _haversineDistanceMeters;
    private _regionQuery;
    private _expandCluster;
    private _addToCluster;
}
