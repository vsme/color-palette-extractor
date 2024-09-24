import "./assets/style.css";
import { kMeans } from "./algorithms/kMeans";

let colors: Map<string, number> = new Map();

// 提取颜色
function extractColors(data: Uint8ClampedArray, count: number) {
  if (count > 20) count = 20;
  const colorMap: Map<string, number> = new Map();
  const colorList: string[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const color = `rgb(${r},${g},${b})`;

    if (!colorMap.has(color)) {
      colorMap.set(color, 1);
      colorList.push(color);
    } else {
      colorMap.set(color, colorMap.get(color)! + 1);
    }
  }

  // 使用 K-means 算法进行颜色聚类
  return colorMap
}

document.getElementById("upload")?.addEventListener("change", function (event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = function () {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const maxWidth = 100;
      const aspectRatio = img.height / img.width;
      canvas.width = maxWidth;
      canvas.height = maxWidth * aspectRatio;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colorCount =
        parseInt(
          (document.getElementById("colorCount") as HTMLInputElement).value
        ) || 5;
      colors = extractColors(imageData.data, colorCount);
      displayColors(colorCount);
    }
  };
});

const handleColorCountInput = function (this: HTMLInputElement) {
  const colorCount = parseInt(this.value);
  if (!this.value || isNaN(colorCount)) return;
  if (colors.size > 0) {
    displayColors(colorCount);
  }
};

const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
const colorCountInput = document.getElementById("colorCount") as HTMLInputElement;
colorCountInput?.addEventListener("input", debounce(handleColorCountInput.bind(colorCountInput), 300));

const addMultipleCheckbox = document.getElementById("addMultiple") as HTMLInputElement;
addMultipleCheckbox?.addEventListener("change", function () {
  const colorCount = parseInt(colorCountInput.value) || 5; // 确保传递的是数字
  displayColors(colorCount);
});

const hexColorCheckbox = document.getElementById("hexColor") as HTMLInputElement;
hexColorCheckbox?.addEventListener("change", function () {
  const colorCount = parseInt(colorCountInput.value) || 5;
  displayColors(colorCount);
});

function displayColors(count: number) {
  const clusters = kMeans(colors, count, { addMultiple: addMultipleCheckbox.checked });

  const colorsDiv = document.getElementById("colors");
  if (colorsDiv) {
    colorsDiv.innerHTML = "";
    clusters.forEach((color) => {
      const colorDiv = document.createElement("div");
      colorDiv.style.backgroundColor = color;
      colorDiv.style.width = "150px";
      colorDiv.style.height = "100px";
      colorDiv.style.display = "inline-block";
      colorDiv.style.position = "relative";

      const colorValue = document.createElement("span");
      colorValue.style.color = "#fff"; // 设置文字颜色为白色以便于阅读
      colorValue.style.position = "absolute"; // 绝对定位
      colorValue.style.fontSize = "12px";
      colorValue.style.width = "max-content";
      colorValue.style.left = "50%"; // 水平居中
      colorValue.style.top = "50%"; // 垂直居中
      colorValue.style.transform = "translate(-50%, -50%)"; // 使文字居中

      // 转换颜色为 16 进制
      if (hexColorCheckbox.checked) {
        const rgb = color.match(/\d+/g);
        const hexColor = rgb ? `#${rgb.map(x => {
          const hex = parseInt(x).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('')}` : color;
        colorValue.textContent = hexColor;
      } else {
        colorValue.textContent = color;
      }

      colorDiv.appendChild(colorValue);
      colorsDiv.appendChild(colorDiv);
    });
  }
}
