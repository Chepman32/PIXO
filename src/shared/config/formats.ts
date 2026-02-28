import { ImageFormat, SupportedInputFormat, SupportedOutputFormat } from '../../types/models';

export interface FormatMeta {
  id: ImageFormat;
  label: string;
  extension: string;
  mimeType: string;
  description: string;
  color: string;
  isInput: boolean;
  isOutput: boolean;
  lossy?: boolean;
  alpha?: boolean;
}

export const FORMAT_META: Record<ImageFormat, FormatMeta> = {
  png: {
    id: 'png',
    label: 'PNG',
    extension: '.png',
    mimeType: 'image/png',
    description: 'Lossless • Alpha',
    color: '#4ADE80',
    isInput: true,
    isOutput: true,
    alpha: true,
  },
  jpg: {
    id: 'jpg',
    label: 'JPEG',
    extension: '.jpg',
    mimeType: 'image/jpeg',
    description: 'Universal • Lossy',
    color: '#FBBF24',
    isInput: true,
    isOutput: true,
    lossy: true,
  },
  webp: {
    id: 'webp',
    label: 'WebP',
    extension: '.webp',
    mimeType: 'image/webp',
    description: 'Modern • Web',
    color: '#60A5FA',
    isInput: true,
    isOutput: true,
    lossy: true,
    alpha: true,
  },
  heic: {
    id: 'heic',
    label: 'HEIC',
    extension: '.heic',
    mimeType: 'image/heic',
    description: 'Apple • Efficient',
    color: '#C084FC',
    isInput: true,
    isOutput: true,
    lossy: true,
  },
  bmp: {
    id: 'bmp',
    label: 'BMP',
    extension: '.bmp',
    mimeType: 'image/bmp',
    description: 'Legacy • Uncompressed',
    color: '#FB923C',
    isInput: true,
    isOutput: true,
  },
  gif: {
    id: 'gif',
    label: 'GIF',
    extension: '.gif',
    mimeType: 'image/gif',
    description: 'Static frame only',
    color: '#F472B6',
    isInput: true,
    isOutput: false,
  },
  tiff: {
    id: 'tiff',
    label: 'TIFF',
    extension: '.tiff',
    mimeType: 'image/tiff',
    description: 'Professional • Lossless',
    color: '#2DD4BF',
    isInput: true,
    isOutput: false,
  },
  pdf: {
    id: 'pdf',
    label: 'PDF',
    extension: '.pdf',
    mimeType: 'application/pdf',
    description: 'Document format',
    color: '#EF4444',
    isInput: false,
    isOutput: true,
  },
};

export const SUPPORTED_INPUT_FORMATS: SupportedInputFormat[] = [
  'png',
  'jpg',
  'webp',
  'heic',
  'bmp',
  'gif',
  'tiff',
];

export const SUPPORTED_OUTPUT_FORMATS: SupportedOutputFormat[] = [
  'png',
  'jpg',
  'webp',
  'heic',
  'bmp',
  'pdf',
];

export const CONVERSION_MATRIX: Record<SupportedInputFormat, SupportedOutputFormat[]> = {
  png: ['jpg', 'webp', 'heic', 'bmp', 'pdf'],
  jpg: ['png', 'webp', 'heic', 'bmp', 'pdf'],
  webp: ['png', 'jpg', 'heic', 'bmp', 'pdf'],
  heic: ['png', 'jpg', 'webp', 'bmp', 'pdf'],
  bmp: ['png', 'jpg', 'webp', 'heic', 'pdf'],
  gif: ['png', 'jpg', 'webp', 'heic', 'bmp', 'pdf'],
  tiff: ['png', 'jpg', 'webp', 'heic', 'bmp', 'pdf'],
};

export const QUICK_ACTIONS: Array<{
  id: string;
  label: string;
  from?: SupportedInputFormat;
  to?: SupportedOutputFormat;
  type: 'preset' | 'batch' | 'favorites';
}> = [
  { id: 'heic-jpg', label: 'HEIC to JPG', from: 'heic', to: 'jpg', type: 'preset' },
  { id: 'png-jpg', label: 'PNG to JPG', from: 'png', to: 'jpg', type: 'preset' },
  { id: 'png-webp', label: 'PNG to WebP', from: 'png', to: 'webp', type: 'preset' },
  { id: 'jpg-png', label: 'JPG to PNG', from: 'jpg', to: 'png', type: 'preset' },
  { id: 'batch', label: 'Batch', type: 'batch' },
  { id: 'favorites', label: 'Favorites', type: 'favorites' },
];
