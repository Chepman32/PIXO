export type ImageFormat =
  | 'png'
  | 'jpg'
  | 'webp'
  | 'heic'
  | 'bmp'
  | 'gif'
  | 'tiff'
  | 'pdf';

export type SupportedInputFormat = Exclude<ImageFormat, 'pdf'>;
export type SupportedOutputFormat = Exclude<ImageFormat, 'gif' | 'tiff'>;

export interface ImageAsset {
  id: string;
  uri: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  format: SupportedInputFormat;
  mimeType?: string;
  createdAt?: string;
}

export interface ConversionOptions {
  quality: number;
  preserveMetadata: boolean;
  compressionLevel?: number;
  progressive?: boolean;
  stripColorProfile?: boolean;
  maxDimension?: number;
  maintainAspectRatio?: boolean;
  keepAlpha?: boolean;
  webpLossless?: boolean;
  pdfMode?: 'single' | 'multi';
}

export interface ConversionSizeStats {
  originalSize: number;
  convertedSize: number;
  compressionRatio: number;
  deltaPercent: number;
}

export interface ConversionResult {
  id: string;
  source: ImageAsset;
  outputPath: string;
  outputFileName: string;
  outputFormat: SupportedOutputFormat;
  dimensions: {
    width: number;
    height: number;
  };
  duration: number;
  size: ConversionSizeStats;
  createdAt: string;
  metadataPreserved: boolean;
}

export interface BatchProgress {
  completed: number;
  total: number;
  currentItemProgress: number;
  overallProgress: number;
  currentItemName?: string;
}

export interface HistoryItem extends ConversionResult {
  favorite: boolean;
  sourcePath: string;
}

export interface ConversionPreset {
  id: string;
  name: string;
  from?: SupportedInputFormat;
  to: SupportedOutputFormat;
  options: ConversionOptions;
  system: boolean;
  createdAt: string;
}

export interface AppSettings {
  defaultFormat: SupportedOutputFormat;
  defaultQuality: number;
  preserveMetadata: boolean;
  autoSaveToPhotos: boolean;
  theme: 'system' | 'light' | 'dark';
  appIcon: 'default' | 'dark' | 'minimal';
  reduceMotion: boolean;
}

export interface FormatEstimate {
  format: SupportedOutputFormat;
  estimatedSize: number;
  percentChange: number;
  status: 'smaller' | 'larger' | 'similar';
}

export interface ConversionTask {
  id: string;
  images: ImageAsset[];
  targetFormat: SupportedOutputFormat;
  options: ConversionOptions;
  presetId?: string;
}

export interface NativeConversionResult {
  outputPath: string;
  originalSize: number;
  convertedSize: number;
  compressionRatio: number;
  duration: number;
  format: SupportedOutputFormat;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface NativeImageMetadata {
  width: number;
  height: number;
  format: string;
  colorSpace: string;
  hasAlpha: boolean;
  dpi: number;
  orientation: number;
  fileSize: number;
  creationDate?: string;
  exifData?: Record<string, unknown>;
}
