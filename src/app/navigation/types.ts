import { ImageAsset, ConversionOptions, ConversionResult, SupportedOutputFormat } from '../../types/models';

export type MainTabParamList = {
  Home: undefined;
  Convert: {
    initialAssets?: ImageAsset[];
    presetTarget?: SupportedOutputFormat;
    presetOptions?: Partial<ConversionOptions>;
  } | undefined;
  History: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  MainTabs: undefined;
  FormatSelection: {
    images: ImageAsset[];
    initialTarget?: SupportedOutputFormat;
    options?: Partial<ConversionOptions>;
  };
  QualitySettings: {
    images: ImageAsset[];
    targetFormat: SupportedOutputFormat;
    options?: Partial<ConversionOptions>;
  };
  ConversionProgress: {
    images: ImageAsset[];
    targetFormat: SupportedOutputFormat;
    options: ConversionOptions;
  };
  ConversionComplete: {
    results: ConversionResult[];
  };
  Preview: {
    result: ConversionResult;
    compareUri?: string;
  };
};
