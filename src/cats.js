// Original twilight cats, shared by battlefield sprites and deployment portraits.
const sheet = new Image();
sheet.src = new URL('../assets/cats.png', import.meta.url).href;
export const catsReady = sheet.decode();

const frames = {
  blade: [0, 640],
  guard: [640, 770],
  archer: [1410, 762],
};

// All frames share the same ground line; preserve their individual silhouettes.
export function drawCat(context, type, x, ground, height) {
  const [left, width] = frames[type];
  const scale = height / 724;
  context.drawImage(sheet, left, 0, width, 724,
    x - width * scale / 2, ground - 674 * scale, width * scale, height);
}
