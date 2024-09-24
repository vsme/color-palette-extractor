import "./assets/style.css";
import { kMeans } from "./algorithms/kMeans";

let colors: Map<string, number> = new Map();
let clusters: string[] = []

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
      canvas.style.visibility = "visible";

      const selectedImageName = document.getElementById("selectedImageName");
      if (selectedImageName) {
        selectedImageName.textContent = file.name;
      }
      getClusters();
      displayColors();
    }
  };
});

const handleColorCountInput = function (this: HTMLInputElement) {
  const colorCount = parseInt(this.value);
  if (!this.value || isNaN(colorCount)) return;
  if (colors.size > 0) {
    getClusters();
    displayColors();
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
  getClusters();
  displayColors();
});

const hexColorCheckbox = document.getElementById("hexColor") as HTMLInputElement;
hexColorCheckbox?.addEventListener("change", function () {
  displayColors();
});

function getClusters() {
  const count = parseInt(colorCountInput.value) || 5; // 确保传递的是数字
  clusters = kMeans(colors, count, { addMultiple: addMultipleCheckbox.checked });
}

function displayColors() {
  const colorsDiv = document.getElementById("colors");
  if (colorsDiv) {
    colorsDiv.innerHTML = "";
    clusters.forEach((color) => {
      const colorDiv = document.createElement("div");
      colorDiv.className = "color-box"; // 设置class
      colorDiv.style.backgroundColor = color;

      const colorValue = document.createElement("span");
      colorValue.className = "span"

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
