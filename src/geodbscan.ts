export default class GeoDBSCAN {
  private _dataset: [number, number][];
  private _epsilon: number;
  private _minPts: number;
  private _clusters: number[][];
  private _noise: number[];
  private _visited: number[];
  private _assigned: number[];
  private _datasetLength = 0;

  constructor() {
    this._dataset = [];
    this._epsilon = 1;
    this._minPts = 2;
    this._clusters = [];
    this._noise = [];
    this._visited = [];
    this._assigned = [];
    this._datasetLength = 0;
  }

  public cluster(
    dataset: [number, number][],
    options: {
      minPts: number;
      epsilon?: number;
    }
  ) {
    if (dataset) {
      if (!(dataset instanceof Array)) {
        throw Error(
          "Dataset must be of type array, " + typeof dataset + " given"
        );
      }

      this._dataset = dataset;
      this._clusters = [];
      this._noise = [];

      this._datasetLength = dataset.length;
      this._visited = new Array(this._datasetLength);
      this._assigned = new Array(this._datasetLength);
    }

    if (options.minPts && typeof options.minPts === "number") {
      this._minPts = options.minPts;
    } else {
      throw Error(
        "Minimum points must be defined and of type number (integer)"
      );
    }

    // Epsilon is optional as we can try to determine
    // a sensible value automatically
    if (options.epsilon) {
      this._epsilon = options.epsilon;
    } else {
      this._epsilon = this._getkNNDistPlotKnee(dataset, this._minPts);
    }

    for (let pointId = 0; pointId < this._datasetLength; pointId++) {
      // If point is not visited, check if it forms a cluster
      if (this._visited[pointId] !== 1) {
        this._visited[pointId] = 1;

        // If closest neighborhood is too small to form a cluster, mark as noise
        const neighbors = this._regionQuery(pointId);

        if (neighbors.length < this._minPts) {
          this._noise.push(pointId);
        } else {
          // Create new cluster and add point
          const clusterId = this._clusters.length;
          this._clusters.push([]);
          this._addToCluster(pointId, clusterId);

          this._expandCluster(clusterId, neighbors);
        }
      }
    }

    return this._clusters;
  }

  private _kNNDistPlot(dataset: [number, number][], k: number) {
    // We can estimate a good epsilon value by determing
    // an ordered list of all the k-th nearest distances
    // from each point
    const kDistances = [];

    dataset.forEach((datapoint, i) => {
      const distances = [];
      dataset.forEach((datapointTwo, j) => {
        if (i !== j) {
          distances.push(
            this._haversineDistanceMeters(datapoint, datapointTwo)
          );
        }
      });
      // Ascending order
      distances.sort((a, b) => a - b);
      kDistances.push(distances[k - 1]);
    });

    kDistances.sort((a, b) => b - a);
    return kDistances;
  }

  private _getkNNDistPlotKnee(dataset: [number, number][], k: number) {
    const kDistances = this._kNNDistPlot(dataset, k);

    let biggestDiff = -Infinity;
    let biggestDiffIndex;

    console.log(kDistances);

    if (dataset.length < 3) {
      throw new Error("Requires at least 3 data points to determine epsilon");
    }

    if (dataset.length === 3) {
      return kDistances[1];
    }

    let total = 0;
    for (let i = 0; i < kDistances.length - 1; i++) {
      const distance = kDistances[i];
      const nextDistance = kDistances[i + 1];
      const diff = distance - nextDistance;
      total += diff;
    }

    const meanDelta = total / kDistances.length - 1;

    const aboveMeanDelta = [];

    for (let i = 0; i < kDistances.length - 1; i++) {
      const distance = kDistances[i];
      const nextDistance = kDistances[i + 1];
      const diff = distance - nextDistance;

      if (diff > meanDelta) {
        aboveMeanDelta.push(true);
      } else {
        aboveMeanDelta.push(false);
      }
    }

    let knee = Math.round(kDistances.length / 2);

    let confidence = aboveMeanDelta.length;
    for (let i = 0; i < aboveMeanDelta.length - 1; i++) {
      if (!aboveMeanDelta[i]) {
        confidence--;
      }

      if (confidence / aboveMeanDelta.length < 3 / 4) {
        knee = i;
        break;
      }
    }

    console.log(JSON.stringify(knee));
    return kDistances[knee];
  }

  private _mergeArrays(a: number[], b: number[]) {
    const len = b.length;

    for (let i = 0; i < len; i++) {
      const P = b[i];
      if (a.indexOf(P) < 0) {
        a.push(P);
      }
    }

    return a;
  }

  private _haversineDistanceMeters(
    pointOne: [number, number],
    pointTwo: [number, number]
  ) {
    const toRadians = (latOrLng: number) => (latOrLng * Math.PI) / 180;

    const phiOne = toRadians(pointOne[1]);
    const lambdaOne = toRadians(pointOne[0]);
    const phiTwo = toRadians(pointTwo[1]);
    const lambdaTwo = toRadians(pointTwo[0]);
    const deltaPhi = phiTwo - phiOne;
    const deltalambda = lambdaTwo - lambdaOne;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phiOne) *
        Math.cos(phiTwo) *
        Math.sin(deltalambda / 2) *
        Math.sin(deltalambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const radius = 6371e3;
    const distance = radius * c;

    return distance;
  }

  private _regionQuery(pointId: number) {
    const neighbors: number[] = [];

    for (let id = 0; id < this._datasetLength; id++) {
      const dist = this._haversineDistanceMeters(
        this._dataset[pointId],
        this._dataset[id]
      );
      if (dist < this._epsilon) {
        neighbors.push(id);
      }
    }

    return neighbors;
  }

  private _expandCluster(clusterId: number, neighbors: number[]) {
    // It's very important to calculate length of neighbors array each time,
    // as the number of elements changes over time
    for (let i = 0; i < neighbors.length; i++) {
      const pointId2 = neighbors[i];
      if (this._visited[pointId2] !== 1) {
        this._visited[pointId2] = 1;
        const neighborsTwo = this._regionQuery(pointId2);

        if (neighborsTwo.length >= this._minPts) {
          neighbors = this._mergeArrays(neighbors, neighborsTwo);
        }
      }

      // Add to cluster
      if (this._assigned[pointId2] !== 1) {
        this._addToCluster(pointId2, clusterId);
      }
    }
  }

  private _addToCluster(pointId: number, clusterId: number) {
    this._clusters[clusterId].push(pointId);
    this._assigned[pointId] = 1;
  }
}
