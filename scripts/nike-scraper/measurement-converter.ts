/**
 * Measurement parsing and unit conversion utilities.
 * Reusable across brand scrapers.
 */

const INCHES_TO_CM = 2.54;

/** Round to 1 decimal place. */
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function inchesToCm(inches: number): number {
  return round1(inches * INCHES_TO_CM);
}

/**
 * Parse a cell value like "35 - 37.5", "35-37.5", "35", or "96.5"
 * into a [min, max] tuple. Returns null if unparseable.
 */
export function parseRange(raw: string): [number, number] | null {
  const cleaned = raw.trim().replace(/,/g, '');
  if (!cleaned) return null;

  // Range pattern: "35 - 37.5" or "35-37.5" or "35 – 37.5"
  const rangeMatch = cleaned.match(
    /^(\d+\.?\d*)\s*[-–—]\s*(\d+\.?\d*)$/,
  );
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (!isNaN(min) && !isNaN(max)) {
      return [Math.min(min, max), Math.max(min, max)];
    }
  }

  // Single value: "28" or "96.5"
  const singleMatch = cleaned.match(/^(\d+\.?\d*)$/);
  if (singleMatch) {
    const val = parseFloat(singleMatch[1]);
    if (!isNaN(val)) {
      return [val, val];
    }
  }

  return null;
}

/**
 * Convert a [min, max] range from the given unit to cm.
 */
export function convertRange(
  range: [number, number],
  unit: 'in' | 'cm',
): [number, number] {
  if (unit === 'cm') return range;
  return [inchesToCm(range[0]), inchesToCm(range[1])];
}

/**
 * Heuristic: if body measurement values (chest, waist, hip) are
 * generally < 60, they're likely in inches. If > 60, likely cm.
 * Foot length is excluded from this heuristic.
 */
export function detectUnit(
  values: number[],
  measurementType: string,
): 'in' | 'cm' {
  if (measurementType === 'foot_length_cm') {
    // Foot length: values > 20 are cm, < 20 are inches
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg > 20 ? 'cm' : 'in';
  }
  // Body measurements: values > 60 are cm
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return avg > 60 ? 'cm' : 'in';
}

/**
 * Map Nike measurement row labels to Fitr database keys.
 * Returns null for unrecognized labels.
 */
export function mapMeasurementLabel(label: string): string | null {
  const normalized = label.toLowerCase().trim()
    // Strip unit indicators like "(in)" or "(cm)"
    .replace(/\s*\((?:in|cm|inches|centimeters)\)\s*/gi, '')
    .trim();

  const LABEL_MAP: Record<string, string> = {
    'chest': 'chest_cm',
    'bust': 'chest_cm',
    'chest/bust': 'chest_cm',
    'waist': 'waist_cm',
    'hips': 'hip_cm',
    'hip': 'hip_cm',
    'inseam': 'inseam_cm',
    'inseam length': 'inseam_cm',
    'shoulder': 'shoulder_width_cm',
    'shoulder width': 'shoulder_width_cm',
    'foot length': 'foot_length_cm',
    'length': 'length_cm',
    'thigh': 'thigh_cm',
    'seat': 'hip_cm',
  };

  return LABEL_MAP[normalized] ?? null;
}
