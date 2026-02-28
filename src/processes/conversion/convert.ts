import { PixoImageConverter } from '../../shared/api/pixoImageConverter';
import { createId } from '../../shared/lib/id';
import {
  BatchProgress,
  ConversionOptions,
  ConversionResult,
  ImageAsset,
  SupportedOutputFormat,
} from '../../types/models';

export const runConversion = async (
  images: ImageAsset[],
  targetFormat: SupportedOutputFormat,
  options: ConversionOptions,
  onProgress?: (progress: BatchProgress) => void,
): Promise<ConversionResult[]> => {
  const fileNameFromPath = (value: string) => {
    const normalized = value.replace('file://', '');
    const chunks = normalized.split('/');
    return chunks[chunks.length - 1] ?? `converted-${Date.now()}`;
  };

  const results: ConversionResult[] = [];

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    onProgress?.({
      completed: index,
      total: images.length,
      currentItemProgress: 0,
      overallProgress: index / images.length,
      currentItemName: image.fileName,
    });

    const nativeResult = await PixoImageConverter.convertImage(
      image.uri,
      targetFormat,
      options,
    );

    const outputFileName = fileNameFromPath(nativeResult.outputPath);
    const deltaPercent =
      image.fileSize > 0
        ? ((nativeResult.convertedSize - image.fileSize) / image.fileSize) * 100
        : 0;

    results.push({
      id: createId(),
      source: image,
      outputPath: nativeResult.outputPath,
      outputFileName,
      outputFormat: targetFormat,
      dimensions: nativeResult.dimensions,
      duration: nativeResult.duration,
      size: {
        originalSize: nativeResult.originalSize || image.fileSize,
        convertedSize: nativeResult.convertedSize,
        compressionRatio: nativeResult.compressionRatio,
        deltaPercent,
      },
      createdAt: new Date().toISOString(),
      metadataPreserved: options.preserveMetadata,
    });

    onProgress?.({
      completed: index + 1,
      total: images.length,
      currentItemProgress: 1,
      overallProgress: (index + 1) / images.length,
      currentItemName: image.fileName,
    });
  }

  return results;
};
