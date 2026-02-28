import Share from 'react-native-share';

export const shareFile = async (path: string) => {
  await Share.open({
    url: path.startsWith('file://') ? path : `file://${path}`,
  });
};

export const shareFiles = async (paths: string[]) => {
  await Share.open({
    urls: paths.map(path => (path.startsWith('file://') ? path : `file://${path}`)),
  });
};
