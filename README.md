# GeoDBSCAN

GeoDBSCAN provides a simple JavaScript implementation and API for the DBSCAN clustering algorithm using a geographic distance function. This allows developers to create clusters based on the geographic density of the points. The code is a modernisation and extension of [density-clustering](https://github.com/uhho/density-clustering).

- [DBSCAN (Wikipedia)](https://en.wikipedia.org/wiki/DBSCAN)
- [DBSCAN original academic paper](http://www2.cs.uh.edu/~ceick/7363/Papers/dbscan.pdf)

Interested in this kind of work? Dent Reality is hiring!

## Installation

```shell
npm install geodbscan
```

## Usage

GeoDBSCAN only has one method, namely `cluster`. It is used like this:

```typescript
// GeoDBSCAN accepts arrays of [number, number] coordinates
// Here let's assume points is an array of GeoJSON points
const coords = points.map((point) => point.geometry.coordinates);

// Now we can generate our clusters
const clusters = geodbscan.cluster(coords, {
  minPts: 2,
  epsilon: 1000,
});

// An Array of Arrays that contain the indexs
// of the coordinates in the cluster
// (from the 'coords' variable)
// [
//   [0, 4, 5, 3],
//   [1, 2],
//   [6, 7, 8, 9, 10, 11, 12, 18, 16, 17, 14, 15, 19, 20, 21, 13],
// ]
```

It takes a second options object argument which has two properties:

- **minPts** - minimum number of points used to form a cluster
- **epsilon?** - the radius of a neighborhood with respect a given point (_this is in meters_). This value is technically optional as we try to calculate a sensible value from a knn distance plot, however you'll probably get better results providing your own value

## Development

We welcome contributions to the library. The code is written in [TypeScript](https://www.typescriptlang.org/), bundled with [microbundle](https://github.com/developit/microbundle) and tested with [Jest](https://jestjs.io/).

### Testing

```shell
npm run test
```

### Building

```shell
npm run build
```

or in watch mode:

```shell
npm run watch
```

## License

MIT License
