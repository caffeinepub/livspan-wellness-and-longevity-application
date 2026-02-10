/**
 * Runtime-safe helpers for working with backend enum/variant values.
 * These functions handle both string-based enums and object-based variants
 * without relying on generated enum constants that may not be available at runtime.
 */

import { Variant_de_en, Gender, TrainingIntensity } from '../backend';

/**
 * Check if a language preference is German
 */
export function isGerman(language: Variant_de_en): boolean {
  // Handle both string enum and object variant shapes
  if (typeof language === 'string') {
    return language === 'de';
  }
  return 'de' in language;
}

/**
 * Check if a language preference is English
 */
export function isEnglish(language: Variant_de_en): boolean {
  if (typeof language === 'string') {
    return language === 'en';
  }
  return 'en' in language;
}

/**
 * Check if gender is male
 */
export function isMale(gender: Gender): boolean {
  if (typeof gender === 'string') {
    return gender === 'male';
  }
  return 'male' in gender;
}

/**
 * Check if gender is female
 */
export function isFemale(gender: Gender): boolean {
  if (typeof gender === 'string') {
    return gender === 'female';
  }
  return 'female' in gender;
}

/**
 * Check if gender is other
 */
export function isOther(gender: Gender): boolean {
  if (typeof gender === 'string') {
    return gender === 'other';
  }
  return 'other' in gender;
}

/**
 * Check training intensity level
 */
export function isLowIntensity(intensity: TrainingIntensity): boolean {
  if (typeof intensity === 'string') {
    return intensity === 'low';
  }
  return 'low' in intensity;
}

export function isMediumIntensity(intensity: TrainingIntensity): boolean {
  if (typeof intensity === 'string') {
    return intensity === 'medium';
  }
  return 'medium' in intensity;
}

export function isHighIntensity(intensity: TrainingIntensity): boolean {
  if (typeof intensity === 'string') {
    return intensity === 'high';
  }
  return 'high' in intensity;
}

/**
 * Get intensity multiplier for training score calculation
 */
export function getIntensityMultiplier(intensity: TrainingIntensity): number {
  if (isLowIntensity(intensity)) return 1;
  if (isMediumIntensity(intensity)) return 2;
  if (isHighIntensity(intensity)) return 3;
  return 1; // fallback
}

/**
 * Get ideal body fat percentage based on gender
 */
export function getIdealBodyFat(gender: Gender): number {
  if (isMale(gender)) return 14.0;
  if (isFemale(gender)) return 21.5;
  return 17.75; // other/default
}
