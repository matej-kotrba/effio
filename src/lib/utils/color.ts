export type ColorRGB = [number, number, number];

export function getContrastRatio(color1: ColorRGB, color2: ColorRGB) {
  function getLuminance(color: number[]) {
    const rgb = color.map(function (value: number) {
      value /= 255; // Translate to 0-1 range
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });

    // Luminance calculation
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }

  // Get contrast ratio
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const contrast = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

  return contrast.toFixed(2);
}