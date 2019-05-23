import { hsl } from 'd3';
import * as _ from 'lodash';

export function rgb2hsl(r, g, b) {
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  const min = Math.min(r1, g1, b1);
  const max = Math.max(r1, g1, b1);
  const d = max - min;
  let h = 0;
  let s = 0;
  const l = (min + max) / 2;
  if (d) {
    s = l < 0.5 ? d / (max + min) : d / (2 - max - min);
    switch (max) {
      case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break;
      case g1: h = (b1 - r1) / d + 2; break;
      default: h = (r1 - g1) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s, l];
}


export function hslColorGenerator(select, { h, s, l }) {
  let colorStops;
  if (select === 0) {
    colorStops = _.map(_.range(0, 110, 10), (i) => ({
      offset: `${i}%`,
      color: hsl(i * 3.6, s, l).hex(),
    }));
  } else if (select === 1) {
    colorStops = _.map(_.range(0, 110, 10), (i) => ({
      offset: `${i}%`,
      color: hsl(h, i / 100, l).hex(),
    }));
  } else {
    colorStops = _.map(_.range(0, 110, 10), (i) => ({
      offset: `${i}%`,
      color: hsl(h, s, i / 100).hex(),
    }));
  }
  return colorStops;
}
