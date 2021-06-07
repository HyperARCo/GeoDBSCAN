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

  describe("cluster", () => {
    it("cluster is defined", () => {
      expect(typeof geodbscan.cluster).toBe("function");
    });

    it("cluster returns", () => {
      expect(typeof geodbscan.cluster).toBe("function");
    });

    it("returns in the expected format (australia)", () => {
      const coords = australiaPoints.map(
        (point) => point.geometry.coordinates as [number, number]
      );

      const minPts = 2;
      const distanceMeters = 1000 * 1100; // 1100km
      const result = geodbscan.cluster(coords, {
        minPts: minPts,
        epsilon: distanceMeters,
      });

      expect(Array.isArray(result));
      expect(result.length > 0);
    });

    it("changing epsilon effects output", () => {
      const coords = australiaPoints.map(
        (point) => point.geometry.coordinates as [number, number]
      );

      expect(
        geodbscan.cluster(coords, {
          minPts: 2,
          epsilon: 1000 * 1100,
        })
      ).not.toStrictEqual(
        geodbscan.cluster(coords, {
          minPts: 2,
          epsilon: 1000 * 1300,
        })
      );
    });

    it("clusters points - 2 min points (world)", () => {
      const coords = worldPoints.map(
        (point) => point.geometry.coordinates as [number, number]
      );

      const minPts = 2;
      const distanceMeters = 1000 * 1100; // 1100km
      const result = geodbscan.cluster(coords, {
        minPts: minPts,
        epsilon: distanceMeters,
      });

      expect(result).toStrictEqual([
        [0, 13, 14, 34, 129, 131, 9, 128, 161, 133, 35, 89, 90, 160, 130, 60],
        [1, 91, 95, 96, 97, 98, 99, 100, 101, 102, 88, 92, 93, 94, 103],
        [
          2,
          136,
          137,
          150,
          151,
          138,
          139,
          140,
          149,
          141,
          39,
          153,
          158,
          152,
          134,
          15,
        ],
        [3, 121, 122, 123],
        [5, 6, 7, 8],
        [10, 33, 32, 132, 11, 31],
        [16, 29, 156, 155, 143, 144, 26, 154, 42, 65, 142],
        [18, 43, 107, 145, 126, 127, 23, 159, 63, 64, 61],
        [22, 62, 24],
        [36, 37, 118, 116, 117, 111, 115, 110, 114, 113],
        [38, 40],
        [41, 106, 105],
        [44, 45, 46, 47, 49, 48, 50, 67],
        [51, 52, 53, 66, 57],
        [54, 55, 56, 58, 59],
        [68, 157],
        [69, 79, 80, 73, 74, 75, 76, 77, 78, 70, 71, 72, 87],
        [83, 84],
        [104, 146],
        [108, 109],
        [112, 124],
        [147, 148],
      ]);
    });

    it("clusters points - 3 min points (world)", () => {
      const coords = worldPoints.map(
        (point) => point.geometry.coordinates as [number, number]
      );

      const minPts = 3;
      const distanceMeters = 1000 * 1100; // 1100km
      const result = geodbscan.cluster(coords, {
        minPts: minPts,
        epsilon: distanceMeters,
      });

      expect(result).toStrictEqual([
        [0, 13, 14, 34, 129, 131, 9, 128, 161, 133, 35, 89, 90, 160, 130, 60],
        [1, 91, 95, 96, 97, 98, 99, 100, 101, 102, 88, 92, 93, 94, 103],
        [
          2,
          136,
          137,
          150,
          151,
          138,
          139,
          140,
          149,
          141,
          39,
          153,
          158,
          152,
          134,
          15,
        ],
        [3, 121, 122, 123],
        [5, 6, 7, 8],
        [11, 31, 32, 132, 33, 10],
        [16, 29, 156, 155, 143, 144, 26, 154, 42, 65, 142],
        [23, 127, 159, 126, 63, 64, 145, 61, 107, 43, 18],
        [36, 37, 118, 116, 117, 111, 115, 110, 114, 113],
        [44, 45, 46, 47, 49, 48, 50, 67],
        [51, 52, 53, 66, 57],
        [54, 55, 56, 58, 59],
        [62, 22, 24],
        [69, 79, 80, 73, 74, 75, 76, 77, 78, 70, 71, 72, 87],
        [106, 41, 105],
      ]);
    });

    it("clusters points without passing a defined epsilon value", () => {
      const coords = worldPoints.map(
        (point) => point.geometry.coordinates as [number, number]
      );

      const result = geodbscan.cluster(coords, {
        minPts: 2,
      });

      expect(result).toStrictEqual([
        [0, 13, 14, 34, 129, 131, 9, 133, 128, 35, 90, 130, 89, 160, 60],
        [1, 91, 97, 98, 99, 100, 101, 88, 92, 93, 94, 95, 96, 102, 103],
        [2, 136, 137, 151, 138, 139, 140, 149, 150, 141, 153, 15, 152],
        [3, 121, 122, 123],
        [5, 6, 7, 8],
        [10, 33, 32, 132, 11, 31],
        [16, 29, 156, 155, 143, 144],
        [18, 43, 107, 145, 126, 127, 23],
        [36, 37, 118, 117, 111, 116, 110, 115, 113, 114],
        [38, 40],
        [39, 134],
        [42, 65, 142, 154],
        [44, 45, 46, 47, 48],
        [49, 50],
        [51, 52, 53, 66],
        [54, 55, 56, 58, 59],
        [61, 63, 64, 159],
        [69, 79, 80, 73, 74, 75, 76, 77, 78, 70, 71, 72, 87],
        [104, 146],
        [105, 106],
        [108, 109],
        [112, 124],
        [147, 148],
      ]);
    });
  });
});
