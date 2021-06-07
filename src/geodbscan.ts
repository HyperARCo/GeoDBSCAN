export default class GeoDBSCAN {
  private _coordinates: [number, number][];
  private _epsilon: number;
  private _minPts: number;
  private _clusters: number[][];
  private _noise: number[];
  private _visited: number[];
  private _assigned: number[];
  private _datasetLength = 0;

  constructor() {
    this._coordinates = [];
    this._epsilon = 1;
    this._minPts = 2;
    this._clusters = [];
    this._noise = [];
    this._visited = [];
    this._assigned = [];
    this._datasetLength = 0;
  }

  public cluster(
    coordinates: [number, number][],
    options: {
      minPts: number;
      epsilon?: number;
    }
  ) {
    if (coordinates) {
      if (!(coordinates instanceof Array)) {
        throw Error(
          "Dataset must be of type array, " + typeof coordinates + " given"
        );
      }

      this._coordinates = coordinates;
      this._clusters = [];
      this._noise = [];

      this._datasetLength = coordinates.length;
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
      this._epsilon = this._getkNNDistPlotKnee(coordinates, this._minPts);
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

    if (dataset.length < 3) {
      throw new Error("Requires at least 3 data points to determine epsilon");
    }

    if (dataset.length === 3) {
      return kDistances[1];
    }

    // This is a best effort attempt to locate
    // the 'knee' in the kNN distance plot.
    // The approach is to sort the top changes across
    // the plot, take the top 50% then iterate through the
    // list again and wait until half of those have been found
    // TODO: Does someone know a better solution?

    const deltas = [];
    for (let i = 0; i < kDistances.length - 1; i++) {
      const distance = kDistances[i];
      const nextDistance = kDistances[i + 1];
      const delta = distance - nextDistance;

      deltas.push({ i, delta });
    }

    let knee = Math.round(kDistances.length / 2);

    const topFiftyPercentDeltas = deltas
      .sort((a, b) => b.delta - a.delta)
      .slice(0, Math.round(deltas.length / 2))
      .map(({ i }) => i);
    let above = 0;

    for (let i = 0; i < kDistances.length - 1; i++) {
      const distance = kDistances[i];
      const nextDistance = kDistances[i + 1];
      const delta = distance - nextDistance;

      if (topFiftyPercentDeltas.includes(i)) {
        above++;
        if (above > topFiftyPercentDeltas.length / 2) {
          knee = i;
          break;
        }
      }
    }

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
        this._coordinates[pointId],
        this._coordinates[id]
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
