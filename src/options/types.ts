export type ViewId = 'signIn' | 'onboarding' | 'conflict' | 'allSet' | 'dashboard';

export type BodyType = 'male' | 'female' | 'youth' | 'enfant';

export type Silhouette = {
  value: string;
  label: string;
  shoulder: number;
  hip: number;
};

export type HeightUnit = 'cm' | 'ft';
export type WeightUnit = 'kg' | 'lb';
export type ShoeUnit = 'EU' | 'US' | 'UK';
export type MeasureUnit = 'cm' | 'in';

export type FitCategory = 'tops' | 'pants' | 'shoes';

export type FitRow = {
  id: string;
  brand: string;
  line: string;
  size: string;
};

export type OnboardingData = {
  username: string;
  nickname: string;
  bodyType: BodyType | null;
  silhouette: string | null;
  height: number;
  heightUnit: HeightUnit;
  weight: number;
  weightUnit: WeightUnit;
  shoeSize: number;
  shoeUnit: ShoeUnit;
  tshirtFit: 'tight' | 'regular' | 'loose';
  hoodieFit: 'tight' | 'regular' | 'loose';
  pantsLength: 'short' | 'regular' | 'long';
  pantsWaist: 'tight' | 'regular' | 'loose';
  fits: Record<FitCategory, FitRow[]>;
};

export const SILHOUETTE_SETS: Record<BodyType, Silhouette[]> = {
  male: [
    { value: 'slim', label: 'Slim', shoulder: 8, hip: 6 },
    { value: 'regular', label: 'Regular', shoulder: 9, hip: 7 },
    { value: 'athletic', label: 'Athletic', shoulder: 11, hip: 7 },
  ],
  female: [
    { value: 'slim', label: 'Slim', shoulder: 7, hip: 7 },
    { value: 'regular', label: 'Regular', shoulder: 8, hip: 8 },
    { value: 'athletic', label: 'Athletic', shoulder: 10, hip: 7 },
    { value: 'curvy', label: 'Curvy', shoulder: 8, hip: 11 },
    { value: 'full', label: 'Full', shoulder: 11, hip: 12 },
  ],
  youth: [
    { value: 'slim', label: 'Slim', shoulder: 7, hip: 6 },
    { value: 'regular', label: 'Regular', shoulder: 8, hip: 7 },
  ],
  enfant: [],
};

export const FIT_SIZE_OPTIONS: Record<FitCategory, string[]> = {
  tops: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  pants: ['28', '29', '30', '31', '32', '33', '34', '36', '38', '40'],
  shoes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'],
};
