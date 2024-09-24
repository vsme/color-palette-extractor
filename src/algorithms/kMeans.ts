// kMeans 函数实现 K-means 聚类算法
export function kMeans(colors: Map<string, number>, k: number, options?: { addMultiple?: boolean }) {
  // 初始化聚类中心
  const centers: string[] = Array.from(colors.keys()).slice(0, k);
  // 创建聚类数组
  const clusters: string[][] = Array.from({ length: k }, () => []);

  let changed: boolean;
  do {
    // 清空聚类
    clusters.forEach((cluster) => (cluster.length = 0));
    changed = false;

    // 将每个颜色分配到最近的聚类中心
    colors.forEach((count, color) => {
      const closestIndex = centers.reduce((closest, center, index) => {
        const distance = colorDistance(color, center);
        // 找到最近的聚类中心
        return distance < colorDistance(color, centers[closest])
          ? index
          : closest;
      }, 0);

      if (options?.addMultiple) {
        // 根据 count 将颜色多次添加到聚类中
        for (let i = 0; i < count; i++) {
          clusters[closestIndex].push(color);
        }
      } else {
        clusters[closestIndex].push(color);
      }
    });

    // 更新聚类中心
    centers.forEach((center, index) => {
      const newCenter = averageColor(clusters[index]);
      // 如果新的中心与旧的不同，则更新
      if (newCenter && newCenter !== center) {
        centers[index] = newCenter;
        changed = true;
      }
    });
  } while (changed);

  // 返回每个聚类的颜色和数量
  return clusters.map((_cluster, index) => (centers[index]));
}

// 计算两个颜色之间的距离
function colorDistance(color1: string, color2: string) {
  const rgb1 = color1.match(/\d+/g)!.map(Number);
  const rgb2 = color2.match(/\d+/g)!.map(Number);
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
  );
}

// 计算颜色的平均值
function averageColor(colors: string[]) {
  if (colors.length === 0) return null;
  const total = colors.reduce(
    (acc, color) => {
      const rgb = color.match(/\d+/g)!.map(Number);
      acc[0] += rgb[0];
      acc[1] += rgb[1];
      acc[2] += rgb[2];
      return acc;
    },
    [0, 0, 0]
  );
  return `rgb(${Math.round(total[0] / colors.length)}, ${Math.round(
    total[1] / colors.length
  )}, ${Math.round(total[2] / colors.length)})`;
}
