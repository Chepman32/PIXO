import { BatchProgress, ConversionOptions, ConversionResult, ImageAsset, SupportedOutputFormat } from '../../types/models';
import { runConversion } from '../conversion/convert';

export const runBatchConversion = (
  images: ImageAsset[],
  targetFormat: SupportedOutputFormat,
  options: ConversionOptions,
  onProgress?: (progress: BatchProgress) => void,
): Promise<ConversionResult[]> => runConversion(images, targetFormat, options, onProgress);
