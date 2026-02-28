import RNFS from 'react-native-fs';
import { ImageAsset, SupportedInputFormat } from '../../types/models';

const FORMAT_EXT_MAP: Record<string, SupportedInputFormat> = {
  png: 'png',
  jpg: 'jpg',
  jpeg: 'jpg',
  webp: 'webp',
  heic: 'heic',
  heif: 'heic',
  bmp: 'bmp',
  gif: 'gif',
  tif: 'tiff',
  tiff: 'tiff',
};

export const getExtension = (fileNameOrPath: string) => {
  const candidate = fileNameOrPath.toLowerCase();
  const parts = candidate.split('.');
  return parts.length > 1 ? parts.pop() ?? '' : '';
};

export const detectFormatFromPath = (
  fileNameOrPath: string,
): SupportedInputFormat => {
  const ext = getExtension(fileNameOrPath);
  return FORMAT_EXT_MAP[ext] ?? 'jpg';
};

export const stripFilePrefix = (uri: string) =>
  uri.startsWith('file://') ? uri.replace('file://', '') : uri;

export const ensureDir = async (path: string) => {
  const exists = await RNFS.exists(path);
  if (!exists) {
    await RNFS.mkdir(path);
  }
};

export const getReadableSize = (size: number) => {
  if (size <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(size) / Math.log(1024));
  const value = size / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

export const getFileStats = async (uri: string) => {
  const path = stripFilePrefix(uri);
  try {
    const stats = await RNFS.stat(path);
    const toIso = (value: unknown) => {
      if (typeof value === 'number') {
        return new Date(value).toISOString();
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return undefined;
    };
    const mtime = toIso((stats as unknown as { mtime?: unknown }).mtime);
    const ctime = toIso((stats as unknown as { ctime?: unknown }).ctime);

    return {
      size: Number(stats.size),
      mtime,
      ctime,
    };
  } catch {
    return {
      size: 0,
      mtime: undefined,
      ctime: undefined,
    };
  }
};

export const normalizeImageAsset = async (
  base: Pick<ImageAsset, 'id' | 'uri' | 'fileName' | 'width' | 'height' | 'mimeType'>,
): Promise<ImageAsset> => {
  const stats = await getFileStats(base.uri);
  return {
    id: base.id,
    uri: base.uri,
    fileName: base.fileName,
    fileSize: stats.size,
    width: base.width,
    height: base.height,
    format: detectFormatFromPath(base.fileName || base.uri),
    mimeType: base.mimeType,
    createdAt: stats.ctime,
  };
};

export const isImageMimeType = (value?: string | null) =>
  Boolean(value && value.startsWith('image/'));
