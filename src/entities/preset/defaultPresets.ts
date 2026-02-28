import { ConversionPreset } from '../../types/models';

const now = new Date().toISOString();

export const defaultPresets: ConversionPreset[] = [
  {
    id: 'preset-heic-jpg',
    name: 'HEIC to JPG',
    from: 'heic',
    to: 'jpg',
    options: {
      quality: 85,
      preserveMetadata: true,
      progressive: true,
      maintainAspectRatio: true,
    },
    system: true,
    createdAt: now,
  },
  {
    id: 'preset-png-webp',
    name: 'PNG to WebP',
    from: 'png',
    to: 'webp',
    options: {
      quality: 82,
      preserveMetadata: false,
      maintainAspectRatio: true,
    },
    system: true,
    createdAt: now,
  },
  {
    id: 'preset-social-jpg',
    name: 'Social JPG',
    to: 'jpg',
    options: {
      quality: 80,
      preserveMetadata: false,
      maxDimension: 2048,
      maintainAspectRatio: true,
      progressive: true,
    },
    system: true,
    createdAt: now,
  },
  {
    id: 'preset-print-png',
    name: 'Print PNG',
    to: 'png',
    options: {
      quality: 100,
      compressionLevel: 4,
      preserveMetadata: true,
      maintainAspectRatio: true,
    },
    system: true,
    createdAt: now,
  },
];
