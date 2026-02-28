import {
  Asset,
  CameraOptions,
  ImageLibraryOptions,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { createId } from '../../shared/lib/id';
import { normalizeImageAsset } from '../../shared/lib/file';
import { ImageAsset } from '../../types/models';

const toImageAsset = async (asset: Asset): Promise<ImageAsset | null> => {
  if (!asset.uri) {
    return null;
  }

  const normalized = await normalizeImageAsset({
    id: createId(),
    uri: asset.uri,
    fileName: asset.fileName ?? `image-${Date.now()}.jpg`,
    width: asset.width ?? 0,
    height: asset.height ?? 0,
    mimeType: asset.type,
  });

  return normalized;
};

export const pickImagesFromLibrary = async (
  selectionLimit = 100,
): Promise<ImageAsset[]> => {
  const options: ImageLibraryOptions = {
    mediaType: 'photo',
    selectionLimit,
    includeExtra: true,
    includeBase64: false,
  };

  const response = await launchImageLibrary(options);
  if (response.didCancel || !response.assets?.length) {
    return [];
  }

  const items = await Promise.all(response.assets.map(toImageAsset));
  return items.filter((item): item is ImageAsset => Boolean(item));
};

export const pickImageFromCamera = async (): Promise<ImageAsset[]> => {
  const options: CameraOptions = {
    mediaType: 'photo',
    saveToPhotos: false,
    includeExtra: true,
  };

  const response = await launchCamera(options);
  if (response.didCancel || !response.assets?.length) {
    return [];
  }

  const first = await toImageAsset(response.assets[0]);
  return first ? [first] : [];
};

export const pickImagesFromFiles = async (): Promise<ImageAsset[]> => {
  const docs = await DocumentPicker.pick({
    allowMultiSelection: true,
    type: [DocumentPicker.types.images],
  });

  const items = await Promise.all(
    docs.map(async doc =>
      normalizeImageAsset({
        id: createId(),
        uri: doc.uri,
        fileName: doc.name ?? `image-${Date.now()}.jpg`,
        width: 0,
        height: 0,
        mimeType: doc.type ?? undefined,
      }),
    ),
  );

  return items;
};
