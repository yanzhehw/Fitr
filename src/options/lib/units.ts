export const CM_PER_IN = 2.54;
export const KG_PER_LB = 0.453592;

const SHOE_EU = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49];
const SHOE_US = [4, 4.5, 5.5, 6.5, 7, 8, 8.5, 9.5, 10, 11, 12, 12.5, 13, 14];
const SHOE_UK = [3.5, 4, 5, 6, 6.5, 7.5, 8, 9, 9.5, 10.5, 11, 11.5, 12.5, 13];

type ShoeUnit = 'EU' | 'US' | 'UK';

function tableFor(unit: ShoeUnit): number[] {
  if (unit === 'EU') return SHOE_EU;
  if (unit === 'US') return SHOE_US;
  return SHOE_UK;
}

export function convertShoeSize(value: number, from: ShoeUnit, to: ShoeUnit): number {
  if (from === to || !value) return value;
  const fromTable = tableFor(from);
  const toTable = tableFor(to);
  let closest = 0;
  let minDiff = Infinity;
  for (let i = 0; i < fromTable.length; i++) {
    const diff = Math.abs(fromTable[i]! - value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  }
  return toTable[closest]!;
}

export function cmToIn(cm: number): number {
  return +(cm / CM_PER_IN).toFixed(1);
}

export function inToCm(inches: number): number {
  return Math.round(inches * CM_PER_IN);
}

export function kgToLb(kg: number): number {
  return Math.round(kg / KG_PER_LB);
}

export function lbToKg(lb: number): number {
  return Math.round(lb * KG_PER_LB);
}

export function cmToFtIn(cm: number): string {
  const totalIn = Math.round(cm / CM_PER_IN);
  const ft = Math.floor(totalIn / 12);
  const inches = totalIn % 12;
  return `${ft}'${inches}"`;
}

export function ftInToCm(str: string): number {
  const m = str.match(/(\d+)['’]\s*(\d+)/);
  if (!m) return parseInt(str, 10) || 0;
  return Math.round((parseInt(m[1]!, 10) * 12 + parseInt(m[2]!, 10)) * CM_PER_IN);
}

export const SHOE_BOUNDS: Record<ShoeUnit, { min: number; max: number; step: number }> = {
  EU: { min: 35, max: 50, step: 0.5 },
  US: { min: 4, max: 15, step: 0.5 },
  UK: { min: 3, max: 14, step: 0.5 },
};
