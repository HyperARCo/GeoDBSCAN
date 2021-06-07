import GeoDBSCAN from "./geodbscan";
import { australiaPoints } from "./fixtures/australia";
import { northAmericaPoints } from "./fixtures/northamerica";
import { clusterToGeoJSONFeatureCollection } from "./utils";
import { worldPoints } from "./fixtures/world";

describe("GeoDBSCAN", () => {
  let geodbscan: GeoDBSCAN;

  beforeEach(() => {
    geodbscan = new GeoDBSCAN();
  });

  it("cluster is defined", () => {
    expect(typeof geodbscan.cluster).toBe("function");
  });

  it("clusters points", () => {
    const coords = australiaPoints.map(
      (point) => point.geometry.coordinates as [number, number]
    );

    const minPts = 2;
    const distanceMeters = 1000 * 1100; // 1100km
    const result = geodbscan.cluster(coords, {
      minPts: minPts,
      epsilon: distanceMeters,
    });

    expect(result).toStrictEqual([
      [0, 1, 2, 3, 5, 4, 6],
      [7, 8, 9, 13],
      [10, 11, 12, 14, 15],
    ]);
  });

  it("clusters points without passing a defined epsilon value", () => {
    const coords = australiaPoints.map(
      (point) => point.geometry.coordinates as [number, number]
    );

    const minPts = 2;
    const result = geodbscan.cluster(coords, {
      minPts: minPts,
    });

    console.log(
      JSON.stringify(clusterToGeoJSONFeatureCollection(result, coords))
    );

    expect(result).toStrictEqual([
      [0, 1, 2, 3, 5, 4, 6],
      [7, 8, 9],
      [10, 11, 12, 14, 15],
      [13],
    ]);
  });

  it("clusters points without passing a defined epsilon value", () => {
    const combinedPoints = [...northAmericaPoints, ...australiaPoints];

    const coords = combinedPoints.map(
      (point) => point.geometry.coordinates as [number, number]
    );

    const minPts = 2;
    const result = geodbscan.cluster(coords, {
      minPts: minPts,
    });

    console.log(
      JSON.stringify(clusterToGeoJSONFeatureCollection(result, coords))
    );

    expect(result).toStrictEqual([
      [0, 4, 5, 3],
      [1, 2],
      [6, 7, 8, 9, 10, 11, 12, 18, 16, 17, 14, 15, 19, 20, 21, 13],
    ]);
  });

  it("world", () => {
    const coords = worldPoints.map(
      (point) => point.geometry.coordinates as [number, number]
    );

    const minPts = 2;
    const result = geodbscan.cluster(coords, {
      minPts: minPts,
    });

    console.log(
      JSON.stringify(clusterToGeoJSONFeatureCollection(result, coords))
    );

    expect(result).toStrictEqual([]);
  });
});
