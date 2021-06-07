const randomColor = () => {
  let color = "#";
  for (let i = 0; i < 6; i++) {
    const random = Math.random();
    const bit = (random * 16) | 0;
    color += bit.toString(16);
  }
  return color;
};

export function clusterToGeoJSONFeatureCollection(
  clusters: number[][],
  originalCoords: [number, number][]
) {
  const final = [];

  console.log(clusters.length);

  const clustedIndex = [];
  clusters.map((cluster, clusterIndex) => {
    const clusterColor = randomColor();
    return cluster.forEach((index) => {
      clustedIndex.push(index);
      final.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: originalCoords[index] },
        properties: { ["marker-color"]: clusterColor },
      });
    });
  });

  originalCoords.forEach((original, index) => {
    if (!clustedIndex.includes(index)) {
      final.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: originalCoords[index] },
        properties: { ["marker-color"]: "#808080" },
      });
    }
  });

  return {
    type: "FeatureCollection",
    features: [...final],
  };
}
