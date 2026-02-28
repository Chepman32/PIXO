import { FS_CACHE, FS_EXPORT, FS_OUTPUT } from '../config/filesystem';
import { ensureDir } from './file';

export const prepareAppFilesystem = async () => {
  await Promise.all([ensureDir(FS_OUTPUT), ensureDir(FS_CACHE), ensureDir(FS_EXPORT)]);
};
