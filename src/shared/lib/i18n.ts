import React, { createContext, useContext, useMemo } from 'react';
import { I18nManager, NativeModules, Platform } from 'react-native';
import { useAppStore } from '../../app/providers/store/useAppStore';
import { AppLocale, AppLocalePreference } from '../../types/models';

type FormatId = 'png' | 'jpg' | 'webp' | 'heic' | 'bmp' | 'gif' | 'tiff' | 'pdf';
type QuickActionId = 'heic-jpg' | 'png-jpg' | 'png-webp' | 'jpg-png' | 'batch' | 'favorites';

interface AppStrings {
  accessibility: {
    openSettings: string;
    openFormatInfo: string;
    goBack: string;
  };
  tabs: {
    home: string;
    convert: string;
    history: string;
    settings: string;
  };
  common: {
    close: string;
    continue: string;
    save: string;
    cancel: string;
    clear: string;
    done: string;
    open: string;
    loading: string;
    savedToPhotos: string;
    saveFailed: string;
    today: string;
    yesterday: string;
    original: string;
    preview: string;
    converted: string;
    sideBySide: string;
    larger: string;
    smaller: string;
    none: string;
  };
  splash: {
    tagline: string;
  };
  home: {
    addImage: string;
    tapToSelect: string;
    quickActions: string;
    recentConversions: string;
    seeAll: string;
    noRecentTitle: string;
    noRecentDescription: string;
  };
  convert: {
    title: string;
    imagesSelected: (count: number) => string;
    totalSize: (size: string) => string;
    selectFormat: string;
    addMoreImages: string;
    noImagesTitle: string;
    noImagesDescription: string;
    addImages: string;
  };
  formatSelection: {
    title: string;
    infoTitle: string;
    infoBody: string;
    convertingFrom: string;
    mixedFormats: string;
    imagesSelected: (count: number) => string;
    selectOutputFormat: string;
  };
  quality: {
    title: string;
    beforeAfter: string;
    outputSizeEstimate: string;
    estimatedSizeLine: (size: string, isSmaller: boolean) => string;
    deltaLine: (delta: number, isSmaller: boolean) => string;
    advancedOptions: string;
    preserveExif: string;
    progressiveLoading: string;
    stripColorProfile: string;
    saveAsPreset: string;
    convertNow: string;
  };
  qualitySlider: {
    title: string;
    low: string;
    medium: string;
    high: string;
  };
  history: {
    title: string;
    edit: string;
    searchPlaceholder: string;
    filters: {
      all: string;
      today: string;
      week: string;
      month: string;
    };
    noConversionsTitle: string;
    noConversionsDescription: string;
    convertAnImage: string;
    deleteSelected: (count: number) => string;
  };
  preview: {
    title: string;
  };
  complete: {
    title: string;
    imagesConverted: (count: number) => string;
    conversionComplete: string;
    moreActionsTitle: string;
    chooseAction: string;
    convertAgain: string;
    viewOriginal: string;
    share: string;
    save: string;
    more: string;
    convertAnother: string;
  };
  progress: {
    title: string;
    converting: string;
    completedCount: (completed: number, total: number) => string;
    steps: {
      readingImage: string;
      processingData: string;
      applyingCompression: string;
      savingOutput: string;
    };
    cancel: string;
    cancelTitle: string;
    cancelBody: string;
    keepConverting: string;
    back: string;
    conversionFailed: string;
  };
  settings: {
    title: string;
    preferences: string;
    appearance: string;
    storage: string;
    about: string;
    defaultFormat: string;
    defaultQuality: string;
    preserveMetadata: string;
    autoSaveToPhotos: string;
    theme: string;
    cacheSize: string;
    clearHistory: string;
    version: string;
    rateSquoze: string;
    privacyPolicy: string;
    termsOfService: string;
    close: string;
    system: string;
    light: string;
    dark: string;
    matchDeviceSettings: string;
    alwaysLightMode: string;
    alwaysDarkMode: string;
    clearHistoryTitle: string;
    clearHistoryBody: string;
    historyItems: (count: number) => string;
  };
  imagePicker: {
    title: string;
    photoLibrary: string;
    photoLibrarySubtitle: string;
    camera: string;
    cameraSubtitle: string;
    files: string;
    filesSubtitle: string;
  };
  formatDescriptions: Record<FormatId, string>;
  quickActions: Record<QuickActionId, string>;
}

const detectDeviceLocale = () => {
  if (Platform.OS === 'ios') {
    const settings = NativeModules.SettingsManager?.settings;
    const preferredLanguages = settings?.AppleLanguages;
    const preferredLanguage =
      Array.isArray(preferredLanguages) && typeof preferredLanguages[0] === 'string'
        ? preferredLanguages[0]
        : undefined;

    if (typeof preferredLanguage === 'string' && preferredLanguage.length > 0) {
      return preferredLanguage.replace('_', '-');
    }

    const fallbackLocale = settings?.AppleLocale;
    if (typeof fallbackLocale === 'string' && fallbackLocale.length > 0) {
      return fallbackLocale.replace('_', '-');
    }
  }

  if (Platform.OS === 'android') {
    const i18nConstants =
      typeof I18nManager.getConstants === 'function' ? I18nManager.getConstants() : undefined;
    const i18nLocale = i18nConstants?.localeIdentifier;
    if (typeof i18nLocale === 'string' && i18nLocale.length > 0) {
      return i18nLocale.replace('_', '-');
    }

    const rawLanguage = NativeModules.I18nManager?.localeIdentifier;
    const preferredLanguage =
      typeof rawLanguage === 'string' ? rawLanguage.replace('_', '-') : undefined;
    if (typeof preferredLanguage === 'string' && preferredLanguage.length > 0) {
      return preferredLanguage;
    }
  }

  const i18nConstants =
    typeof I18nManager.getConstants === 'function' ? I18nManager.getConstants() : undefined;
  const i18nLocale = i18nConstants?.localeIdentifier;
  if (typeof i18nLocale === 'string' && i18nLocale.length > 0) {
    return i18nLocale.replace('_', '-');
  }

  return Intl.DateTimeFormat().resolvedOptions().locale || 'en';
};

export const SUPPORTED_APP_LOCALES: AppLocale[] = [
  'en',
  'zh-Hans',
  'ja',
  'ko',
  'de',
  'fr',
  'es-MX',
  'pt-BR',
  'ar',
  'ru',
  'it',
  'hi',
  'fil',
];

export const resolveAppLocale = (input?: string): AppLocale => {
  const value = (input || detectDeviceLocale()).toLowerCase();

  if (value.startsWith('zh')) {
    return 'zh-Hans';
  }
  if (value.startsWith('ja')) {
    return 'ja';
  }
  if (value.startsWith('ko')) {
    return 'ko';
  }
  if (value.startsWith('de')) {
    return 'de';
  }
  if (value.startsWith('fr')) {
    return 'fr';
  }
  if (value.startsWith('es')) {
    return 'es-MX';
  }
  if (value.startsWith('pt')) {
    return 'pt-BR';
  }
  if (value.startsWith('ar')) {
    return 'ar';
  }
  if (value.startsWith('ru')) {
    return 'ru';
  }
  if (value.startsWith('it')) {
    return 'it';
  }
  if (value.startsWith('hi')) {
    return 'hi';
  }
  if (value.startsWith('fil') || value.startsWith('tl')) {
    return 'fil';
  }

  return 'en';
};

export const getAppLocale = (preference: AppLocalePreference = 'system') =>
  preference === 'system' ? resolveAppLocale(detectDeviceLocale()) : resolveAppLocale(preference);

const getCurrentLocalePreference = (): AppLocalePreference =>
  useAppStore.getState().settings.locale ?? 'system';

const translations: Record<AppLocale, AppStrings> = {
  en: {
    accessibility: {
      openSettings: 'Open settings',
      openFormatInfo: 'Open format info',
      goBack: 'Go back',
    },
    tabs: {
      home: 'Home',
      convert: 'Convert',
      history: 'History',
      settings: 'Settings',
    },
    common: {
      close: 'Close',
      continue: 'Continue',
      save: 'Save',
      cancel: 'Cancel',
      clear: 'Clear',
      done: 'Done',
      open: 'Open',
      loading: 'Loading...',
      savedToPhotos: 'Saved to Photos',
      saveFailed: 'Save failed',
      today: 'Today',
      yesterday: 'Yesterday',
      original: 'Original',
      preview: 'Preview',
      converted: 'Converted',
      sideBySide: 'Side by Side',
      larger: 'larger',
      smaller: 'smaller',
      none: 'None',
    },
    splash: {
      tagline: 'Image Converter',
    },
    home: {
      addImage: 'Add Image',
      tapToSelect: 'Tap to select or drag and drop',
      quickActions: 'Quick Actions',
      recentConversions: 'Recent Conversions',
      seeAll: 'See All',
      noRecentTitle: 'No recent conversions',
      noRecentDescription: 'Your converted images will appear here',
    },
    convert: {
      title: 'Convert',
      imagesSelected: count => `${count} image${count === 1 ? '' : 's'} selected`,
      totalSize: size => `Total size: ${size}`,
      selectFormat: 'Select Format',
      addMoreImages: 'Add More Images',
      noImagesTitle: 'No images selected',
      noImagesDescription: 'Add images from library, camera, or files to start conversion.',
      addImages: 'Add Images',
    },
    formatSelection: {
      title: 'Select Format',
      infoTitle: 'Format Information',
      infoBody:
        'Choose a target format based on compatibility and size. JPG is best for photos, PNG for transparency, WebP for web optimization, HEIC for iOS storage efficiency.',
      convertingFrom: 'Converting from:',
      mixedFormats: 'Mixed formats',
      imagesSelected: count => `${count} images selected`,
      selectOutputFormat: 'Select output format:',
    },
    quality: {
      title: 'Quality Settings',
      beforeAfter: 'Before / After',
      outputSizeEstimate: 'Output Size Estimate',
      estimatedSizeLine: (size, isSmaller) => `${size} (${isSmaller ? 'smaller' : 'larger'})`,
      deltaLine: (delta, isSmaller) =>
        `${isSmaller ? '↓' : '↑'} ${Math.abs(delta).toFixed(0)}% ${isSmaller ? 'smaller' : 'larger'} than original`,
      advancedOptions: 'Advanced Options',
      preserveExif: 'Preserve EXIF Data',
      progressiveLoading: 'Progressive Loading',
      stripColorProfile: 'Strip Color Profile',
      saveAsPreset: 'Save as Preset',
      convertNow: 'Convert Now',
    },
    qualitySlider: {
      title: 'Quality',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    },
    history: {
      title: 'History',
      edit: 'Edit',
      searchPlaceholder: 'Search conversions...',
      filters: {
        all: 'All',
        today: 'Today',
        week: 'This Week',
        month: 'This Month',
      },
      noConversionsTitle: 'No Conversions Yet',
      noConversionsDescription:
        'Your conversion history will appear here. Start by converting your first image.',
      convertAnImage: 'Convert an Image',
      deleteSelected: count => `Delete Selected (${count})`,
    },
    preview: {
      title: 'Preview',
    },
    complete: {
      title: 'Complete',
      imagesConverted: count => `${count} Images Converted`,
      conversionComplete: 'Conversion Complete!',
      moreActionsTitle: 'More Actions',
      chooseAction: 'Choose an action',
      convertAgain: 'Convert Again',
      viewOriginal: 'View Original',
      share: 'Share',
      save: 'Save',
      more: 'More',
      convertAnother: 'Convert Another',
    },
    progress: {
      title: 'Converting',
      converting: 'Converting...',
      completedCount: (completed, total) => `${completed} of ${total} complete`,
      steps: {
        readingImage: 'Reading image',
        processingData: 'Processing data',
        applyingCompression: 'Applying compression',
        savingOutput: 'Saving output',
      },
      cancel: 'Cancel',
      cancelTitle: 'Cancel Conversion?',
      cancelBody: 'Current progress will be lost.',
      keepConverting: 'Keep converting',
      back: 'Back',
      conversionFailed: 'Conversion Failed',
    },
    settings: {
      title: 'Settings',
      preferences: 'PREFERENCES',
      appearance: 'APPEARANCE',
      storage: 'STORAGE',
      about: 'ABOUT',
      defaultFormat: 'Default Format',
      defaultQuality: 'Default Quality',
      preserveMetadata: 'Preserve Metadata',
      autoSaveToPhotos: 'Auto-Save to Photos',
      theme: 'Theme',
      cacheSize: 'Cache Size',
      clearHistory: 'Clear History',
      version: 'Version',
      rateSquoze: 'Rate Squoze',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      close: 'Close',
      system: 'System',
      light: 'Light',
      dark: 'Dark',
      matchDeviceSettings: 'Match device settings',
      alwaysLightMode: 'Always light mode',
      alwaysDarkMode: 'Always dark mode',
      clearHistoryTitle: 'Clear History',
      clearHistoryBody: 'Delete all conversion history?',
      historyItems: count => `${count} items`,
    },
    imagePicker: {
      title: 'Select Images',
      photoLibrary: 'Photo Library',
      photoLibrarySubtitle: 'Select one or more photos',
      camera: 'Camera',
      cameraSubtitle: 'Take a new photo',
      files: 'Files',
      filesSubtitle: 'Import from local files',
    },
    formatDescriptions: {
      png: 'Lossless • Alpha',
      jpg: 'Universal • Lossy',
      webp: 'Modern • Web',
      heic: 'Apple • Efficient',
      bmp: 'Legacy • Uncompressed',
      gif: 'Static frame only',
      tiff: 'Professional • Lossless',
      pdf: 'Document format',
    },
    quickActions: {
      'heic-jpg': 'HEIC to JPG',
      'png-jpg': 'PNG to JPG',
      'png-webp': 'PNG to WebP',
      'jpg-png': 'JPG to PNG',
      batch: 'Batch',
      favorites: 'Favorites',
    },
  },
  'zh-Hans': {
    accessibility: {
      openSettings: '打开设置',
      openFormatInfo: '打开格式说明',
      goBack: '返回',
    },
    tabs: {
      home: '首页',
      convert: '转换',
      history: '记录',
      settings: '设置',
    },
    common: {
      close: '关闭',
      continue: '继续',
      save: '保存',
      cancel: '取消',
      clear: '清除',
      done: '完成',
      open: '打开',
      loading: '加载中...',
      savedToPhotos: '已保存到照片',
      saveFailed: '保存失败',
      today: '今天',
      yesterday: '昨天',
      original: '原图',
      preview: '预览',
      converted: '转换后',
      sideBySide: '并排对比',
      larger: '更大',
      smaller: '更小',
      none: '无',
    },
    splash: {
      tagline: '图片转换工具',
    },
    home: {
      addImage: '添加图片',
      tapToSelect: '点按选择，也可拖放文件',
      quickActions: '快捷操作',
      recentConversions: '最近转换',
      seeAll: '查看全部',
      noRecentTitle: '还没有最近转换',
      noRecentDescription: '你转换过的图片会显示在这里',
    },
    convert: {
      title: '转换',
      imagesSelected: count => `已选择 ${count} 张图片`,
      totalSize: size => `总大小：${size}`,
      selectFormat: '选择格式',
      addMoreImages: '继续添加图片',
      noImagesTitle: '尚未选择图片',
      noImagesDescription: '从相册、相机或文件中添加图片，即可开始转换。',
      addImages: '添加图片',
    },
    formatSelection: {
      title: '选择格式',
      infoTitle: '格式说明',
      infoBody:
        '请根据兼容性和文件大小选择目标格式。JPG 适合照片，PNG 适合透明背景，WebP 适合网页优化，HEIC 更适合 iOS 节省存储空间。',
      convertingFrom: '正在转换自：',
      mixedFormats: '混合格式',
      imagesSelected: count => `已选择 ${count} 张图片`,
      selectOutputFormat: '选择输出格式：',
    },
    quality: {
      title: '质量设置',
      beforeAfter: '前后对比',
      outputSizeEstimate: '输出大小预估',
      estimatedSizeLine: (size, isSmaller) => `${size}（${isSmaller ? '更小' : '更大'}）`,
      deltaLine: (delta, isSmaller) =>
        `${isSmaller ? '↓' : '↑'} ${Math.abs(delta).toFixed(0)}%，比原图${isSmaller ? '更小' : '更大'}`,
      advancedOptions: '高级选项',
      preserveExif: '保留 EXIF 信息',
      progressiveLoading: '渐进式加载',
      stripColorProfile: '移除色彩配置文件',
      saveAsPreset: '保存为预设',
      convertNow: '立即转换',
    },
    qualitySlider: {
      title: '质量',
      low: '低',
      medium: '中',
      high: '高',
    },
    history: {
      title: '记录',
      edit: '编辑',
      searchPlaceholder: '搜索转换记录...',
      filters: {
        all: '全部',
        today: '今天',
        week: '本周',
        month: '本月',
      },
      noConversionsTitle: '还没有转换记录',
      noConversionsDescription: '你的转换记录会显示在这里。先去完成第一次转换吧。',
      convertAnImage: '转换图片',
      deleteSelected: count => `删除所选（${count}）`,
    },
    preview: {
      title: '预览',
    },
    complete: {
      title: '完成',
      imagesConverted: count => `已转换 ${count} 张图片`,
      conversionComplete: '转换完成！',
      moreActionsTitle: '更多操作',
      chooseAction: '请选择操作',
      convertAgain: '再次转换',
      viewOriginal: '查看原图',
      share: '分享',
      save: '保存',
      more: '更多',
      convertAnother: '继续转换',
    },
    progress: {
      title: '正在转换',
      converting: '正在转换...',
      completedCount: (completed, total) => `已完成 ${completed}/${total}`,
      steps: {
        readingImage: '读取图片',
        processingData: '处理数据',
        applyingCompression: '应用压缩',
        savingOutput: '保存输出',
      },
      cancel: '取消',
      cancelTitle: '取消转换？',
      cancelBody: '当前进度将不会保留。',
      keepConverting: '继续转换',
      back: '返回',
      conversionFailed: '转换失败',
    },
    settings: {
      title: '设置',
      preferences: '偏好设置',
      appearance: '外观',
      storage: '存储',
      about: '关于',
      defaultFormat: '默认格式',
      defaultQuality: '默认质量',
      preserveMetadata: '保留元数据',
      autoSaveToPhotos: '自动保存到照片',
      theme: '主题',
      cacheSize: '缓存大小',
      clearHistory: '清空记录',
      version: '版本',
      rateSquoze: '给 Squoze 评分',
      privacyPolicy: '隐私政策',
      termsOfService: '服务条款',
      close: '关闭',
      system: '跟随系统',
      light: '浅色',
      dark: '深色',
      matchDeviceSettings: '跟随设备设置',
      alwaysLightMode: '始终使用浅色模式',
      alwaysDarkMode: '始终使用深色模式',
      clearHistoryTitle: '清空记录',
      clearHistoryBody: '要删除所有转换记录吗？',
      historyItems: count => `${count} 项`,
    },
    imagePicker: {
      title: '选择图片',
      photoLibrary: '照片图库',
      photoLibrarySubtitle: '选择一张或多张照片',
      camera: '相机',
      cameraSubtitle: '拍摄新照片',
      files: '文件',
      filesSubtitle: '从本地文件导入',
    },
    formatDescriptions: {
      png: '无损 • 支持透明',
      jpg: '通用 • 有损',
      webp: '现代 • 网页适用',
      heic: 'Apple • 高效',
      bmp: '传统 • 未压缩',
      gif: '仅支持静态帧',
      tiff: '专业级 • 无损',
      pdf: '文档格式',
    },
    quickActions: {
      'heic-jpg': 'HEIC 转 JPG',
      'png-jpg': 'PNG 转 JPG',
      'png-webp': 'PNG 转 WebP',
      'jpg-png': 'JPG 转 PNG',
      batch: '批量转换',
      favorites: '收藏',
    },
  },
  ja: {
    accessibility: {
      openSettings: '設定を開く',
      openFormatInfo: 'フォーマット情報を開く',
      goBack: '戻る',
    },
    tabs: {
      home: 'ホーム',
      convert: '変換',
      history: '履歴',
      settings: '設定',
    },
    common: {
      close: '閉じる',
      continue: '続ける',
      save: '保存',
      cancel: 'キャンセル',
      clear: '消去',
      done: '完了',
      open: '開く',
      loading: '読み込み中...',
      savedToPhotos: '写真に保存しました',
      saveFailed: '保存に失敗しました',
      today: '今日',
      yesterday: '昨日',
      original: '元画像',
      preview: 'プレビュー',
      converted: '変換後',
      sideBySide: '左右比較',
      larger: '大きい',
      smaller: '小さい',
      none: 'なし',
    },
    splash: {
      tagline: '画像変換アプリ',
    },
    home: {
      addImage: '画像を追加',
      tapToSelect: 'タップして選択、またはドラッグ＆ドロップ',
      quickActions: 'クイックアクション',
      recentConversions: '最近の変換',
      seeAll: 'すべて見る',
      noRecentTitle: '最近の変換はまだありません',
      noRecentDescription: '変換した画像はここに表示されます',
    },
    convert: {
      title: '変換',
      imagesSelected: count => `${count}枚の画像を選択中`,
      totalSize: size => `合計サイズ: ${size}`,
      selectFormat: '形式を選択',
      addMoreImages: '画像を追加',
      noImagesTitle: '画像が選択されていません',
      noImagesDescription: 'ライブラリ、カメラ、またはファイルから画像を追加して変換を始めましょう。',
      addImages: '画像を追加',
    },
    formatSelection: {
      title: '形式を選択',
      infoTitle: '形式について',
      infoBody:
        '互換性とサイズを見ながら出力形式を選んでください。JPG は写真向き、PNG は透過向き、WebP はWeb最適化向き、HEIC はiPhoneでの保存効率に優れています。',
      convertingFrom: '変換元:',
      mixedFormats: '混在フォーマット',
      imagesSelected: count => `${count}枚の画像を選択中`,
      selectOutputFormat: '出力形式を選択:',
    },
    quality: {
      title: '画質設定',
      beforeAfter: '変換前 / 変換後',
      outputSizeEstimate: '出力サイズの目安',
      estimatedSizeLine: (size, isSmaller) => `${size}（${isSmaller ? '小さめ' : '大きめ'}）`,
      deltaLine: (delta, isSmaller) =>
        `${isSmaller ? '↓' : '↑'} ${Math.abs(delta).toFixed(0)}% 元画像より${isSmaller ? '小さく' : '大きく'}なります`,
      advancedOptions: '詳細オプション',
      preserveExif: 'EXIFデータを保持',
      progressiveLoading: 'プログレッシブ表示',
      stripColorProfile: 'カラープロファイルを削除',
      saveAsPreset: 'プリセットとして保存',
      convertNow: '今すぐ変換',
    },
    qualitySlider: {
      title: '画質',
      low: '低',
      medium: '中',
      high: '高',
    },
    history: {
      title: '履歴',
      edit: '編集',
      searchPlaceholder: '変換履歴を検索...',
      filters: {
        all: 'すべて',
        today: '今日',
        week: '今週',
        month: '今月',
      },
      noConversionsTitle: '変換履歴はまだありません',
      noConversionsDescription: '変換履歴はここに表示されます。まずは最初の画像を変換してみましょう。',
      convertAnImage: '画像を変換',
      deleteSelected: count => `選択項目を削除（${count}）`,
    },
    preview: {
      title: 'プレビュー',
    },
    complete: {
      title: '完了',
      imagesConverted: count => `${count}枚の画像を変換しました`,
      conversionComplete: '変換が完了しました！',
      moreActionsTitle: 'その他の操作',
      chooseAction: '操作を選択してください',
      convertAgain: 'もう一度変換',
      viewOriginal: '元画像を見る',
      share: '共有',
      save: '保存',
      more: 'その他',
      convertAnother: '別の画像を変換',
    },
    progress: {
      title: '変換中',
      converting: '変換しています...',
      completedCount: (completed, total) => `${total}件中${completed}件完了`,
      steps: {
        readingImage: '画像を読み込み中',
        processingData: 'データを処理中',
        applyingCompression: '圧縮を適用中',
        savingOutput: '出力を保存中',
      },
      cancel: 'キャンセル',
      cancelTitle: '変換をキャンセルしますか？',
      cancelBody: '現在の進行状況は失われます。',
      keepConverting: 'このまま続ける',
      back: '戻る',
      conversionFailed: '変換に失敗しました',
    },
    settings: {
      title: '設定',
      preferences: '設定項目',
      appearance: '表示',
      storage: 'ストレージ',
      about: '情報',
      defaultFormat: 'デフォルト形式',
      defaultQuality: 'デフォルト画質',
      preserveMetadata: 'メタデータを保持',
      autoSaveToPhotos: '写真に自動保存',
      theme: 'テーマ',
      cacheSize: 'キャッシュサイズ',
      clearHistory: '履歴を削除',
      version: 'バージョン',
      rateSquoze: 'Squozeを評価',
      privacyPolicy: 'プライバシーポリシー',
      termsOfService: '利用規約',
      close: '閉じる',
      system: 'システム',
      light: 'ライト',
      dark: 'ダーク',
      matchDeviceSettings: '端末設定に合わせる',
      alwaysLightMode: '常にライトモード',
      alwaysDarkMode: '常にダークモード',
      clearHistoryTitle: '履歴を削除',
      clearHistoryBody: '変換履歴をすべて削除しますか？',
      historyItems: count => `${count}件`,
    },
    imagePicker: {
      title: '画像を選択',
      photoLibrary: '写真ライブラリ',
      photoLibrarySubtitle: '1枚以上の写真を選択',
      camera: 'カメラ',
      cameraSubtitle: '新しい写真を撮る',
      files: 'ファイル',
      filesSubtitle: 'ローカルファイルから読み込む',
    },
    formatDescriptions: {
      png: '可逆圧縮 • 透過対応',
      jpg: '汎用 • 非可逆圧縮',
      webp: 'モダン • Web向け',
      heic: 'Apple • 高効率',
      bmp: '旧形式 • 非圧縮',
      gif: '静止フレームのみ',
      tiff: '業務向け • 可逆圧縮',
      pdf: 'ドキュメント形式',
    },
    quickActions: {
      'heic-jpg': 'HEICからJPG',
      'png-jpg': 'PNGからJPG',
      'png-webp': 'PNGからWebP',
      'jpg-png': 'JPGからPNG',
      batch: '一括変換',
      favorites: 'お気に入り',
    },
  },
  ko: {
    accessibility: {
      openSettings: '설정 열기',
      openFormatInfo: '포맷 정보 열기',
      goBack: '뒤로 가기',
    },
    tabs: {
      home: '홈',
      convert: '변환',
      history: '기록',
      settings: '설정',
    },
    common: {
      close: '닫기',
      continue: '계속',
      save: '저장',
      cancel: '취소',
      clear: '지우기',
      done: '완료',
      open: '열기',
      loading: '불러오는 중...',
      savedToPhotos: '사진에 저장됨',
      saveFailed: '저장에 실패했습니다',
      today: '오늘',
      yesterday: '어제',
      original: '원본',
      preview: '미리보기',
      converted: '변환본',
      sideBySide: '나란히 보기',
      larger: '더 큼',
      smaller: '더 작음',
      none: '없음',
    },
    splash: {
      tagline: '이미지 변환 앱',
    },
    home: {
      addImage: '이미지 추가',
      tapToSelect: '탭해서 선택하거나 드래그 앤 드롭',
      quickActions: '빠른 작업',
      recentConversions: '최근 변환',
      seeAll: '전체 보기',
      noRecentTitle: '최근 변환이 없습니다',
      noRecentDescription: '변환한 이미지가 여기에 표시됩니다',
    },
    convert: {
      title: '변환',
      imagesSelected: count => `${count}개의 이미지를 선택함`,
      totalSize: size => `전체 크기: ${size}`,
      selectFormat: '형식 선택',
      addMoreImages: '이미지 더 추가',
      noImagesTitle: '선택된 이미지가 없습니다',
      noImagesDescription: '앨범, 카메라 또는 파일에서 이미지를 추가해 변환을 시작하세요.',
      addImages: '이미지 추가',
    },
    formatSelection: {
      title: '형식 선택',
      infoTitle: '형식 안내',
      infoBody:
        '호환성과 용량을 기준으로 출력 형식을 선택하세요. JPG는 사진에 적합하고, PNG는 투명 배경에 좋으며, WebP는 웹 최적화에, HEIC는 iOS 저장 공간 절약에 유리합니다.',
      convertingFrom: '변환 원본:',
      mixedFormats: '혼합 형식',
      imagesSelected: count => `${count}개의 이미지를 선택함`,
      selectOutputFormat: '출력 형식 선택:',
    },
    quality: {
      title: '품질 설정',
      beforeAfter: '변환 전 / 후',
      outputSizeEstimate: '예상 출력 크기',
      estimatedSizeLine: (size, isSmaller) => `${size} (${isSmaller ? '더 작음' : '더 큼'})`,
      deltaLine: (delta, isSmaller) =>
        `${isSmaller ? '↓' : '↑'} 원본보다 ${Math.abs(delta).toFixed(0)}% ${isSmaller ? '작음' : '큼'}`,
      advancedOptions: '고급 옵션',
      preserveExif: 'EXIF 데이터 유지',
      progressiveLoading: '프로그레시브 로딩',
      stripColorProfile: '색상 프로필 제거',
      saveAsPreset: '프리셋으로 저장',
      convertNow: '지금 변환',
    },
    qualitySlider: {
      title: '품질',
      low: '낮음',
      medium: '보통',
      high: '높음',
    },
    history: {
      title: '기록',
      edit: '편집',
      searchPlaceholder: '변환 기록 검색...',
      filters: {
        all: '전체',
        today: '오늘',
        week: '이번 주',
        month: '이번 달',
      },
      noConversionsTitle: '아직 변환 기록이 없습니다',
      noConversionsDescription: '변환 기록은 여기에 표시됩니다. 첫 이미지를 변환해 보세요.',
      convertAnImage: '이미지 변환',
      deleteSelected: count => `선택 항목 삭제 (${count})`,
    },
    preview: {
      title: '미리보기',
    },
    complete: {
      title: '완료',
      imagesConverted: count => `${count}개 이미지 변환 완료`,
      conversionComplete: '변환이 완료되었습니다!',
      moreActionsTitle: '추가 작업',
      chooseAction: '작업을 선택하세요',
      convertAgain: '다시 변환',
      viewOriginal: '원본 보기',
      share: '공유',
      save: '저장',
      more: '더 보기',
      convertAnother: '다른 이미지 변환',
    },
    progress: {
      title: '변환 중',
      converting: '변환 중...',
      completedCount: (completed, total) => `${total}개 중 ${completed}개 완료`,
      steps: {
        readingImage: '이미지 읽는 중',
        processingData: '데이터 처리 중',
        applyingCompression: '압축 적용 중',
        savingOutput: '결과 저장 중',
      },
      cancel: '취소',
      cancelTitle: '변환을 취소할까요?',
      cancelBody: '현재 진행 상황은 저장되지 않습니다.',
      keepConverting: '계속 변환',
      back: '뒤로',
      conversionFailed: '변환에 실패했습니다',
    },
    settings: {
      title: '설정',
      preferences: '환경 설정',
      appearance: '모양',
      storage: '저장 공간',
      about: '정보',
      defaultFormat: '기본 형식',
      defaultQuality: '기본 품질',
      preserveMetadata: '메타데이터 유지',
      autoSaveToPhotos: '사진에 자동 저장',
      theme: '테마',
      cacheSize: '캐시 크기',
      clearHistory: '기록 지우기',
      version: '버전',
      rateSquoze: 'Squoze 평가하기',
      privacyPolicy: '개인정보 처리방침',
      termsOfService: '서비스 약관',
      close: '닫기',
      system: '시스템',
      light: '라이트',
      dark: '다크',
      matchDeviceSettings: '기기 설정 따르기',
      alwaysLightMode: '항상 라이트 모드',
      alwaysDarkMode: '항상 다크 모드',
      clearHistoryTitle: '기록 지우기',
      clearHistoryBody: '모든 변환 기록을 삭제할까요?',
      historyItems: count => `${count}개`,
    },
    imagePicker: {
      title: '이미지 선택',
      photoLibrary: '사진 보관함',
      photoLibrarySubtitle: '사진을 하나 이상 선택',
      camera: '카메라',
      cameraSubtitle: '새 사진 촬영',
      files: '파일',
      filesSubtitle: '로컬 파일에서 가져오기',
    },
    formatDescriptions: {
      png: '무손실 • 알파 지원',
      jpg: '범용 • 손실 압축',
      webp: '최신형 • 웹용',
      heic: 'Apple • 고효율',
      bmp: '레거시 • 무압축',
      gif: '정지 프레임만 지원',
      tiff: '전문용 • 무손실',
      pdf: '문서 형식',
    },
    quickActions: {
      'heic-jpg': 'HEIC → JPG',
      'png-jpg': 'PNG → JPG',
      'png-webp': 'PNG → WebP',
      'jpg-png': 'JPG → PNG',
      batch: '일괄 변환',
      favorites: '즐겨찾기',
    },
  },
  de: {
    accessibility: {
      openSettings: 'Einstellungen öffnen',
      openFormatInfo: 'Formatinfo öffnen',
      goBack: 'Zurück',
    },
    tabs: {
      home: 'Start',
      convert: 'Konvertieren',
      history: 'Verlauf',
      settings: 'Einstellungen',
    },
    common: {
      close: 'Schließen',
      continue: 'Weiter',
      save: 'Speichern',
      cancel: 'Abbrechen',
      clear: 'Löschen',
      done: 'Fertig',
      open: 'Öffnen',
      loading: 'Wird geladen...',
      savedToPhotos: 'In Fotos gespeichert',
      saveFailed: 'Speichern fehlgeschlagen',
      today: 'Heute',
      yesterday: 'Gestern',
      original: 'Original',
      preview: 'Vorschau',
      converted: 'Konvertiert',
      sideBySide: 'Nebeneinander',
      larger: 'größer',
      smaller: 'kleiner',
      none: 'Keine',
    },
    splash: {
      tagline: 'Bildkonverter',
    },
    home: {
      addImage: 'Bild hinzufügen',
      tapToSelect: 'Tippen zum Auswählen oder per Drag-and-drop',
      quickActions: 'Schnellaktionen',
      recentConversions: 'Letzte Konvertierungen',
      seeAll: 'Alle anzeigen',
      noRecentTitle: 'Noch keine Konvertierungen',
      noRecentDescription: 'Deine konvertierten Bilder erscheinen hier',
    },
    convert: {
      title: 'Konvertieren',
      imagesSelected: count => `${count} Bild${count === 1 ? '' : 'er'} ausgewählt`,
      totalSize: size => `Gesamtgröße: ${size}`,
      selectFormat: 'Format auswählen',
      addMoreImages: 'Weitere Bilder hinzufügen',
      noImagesTitle: 'Keine Bilder ausgewählt',
      noImagesDescription: 'Füge Bilder aus der Mediathek, Kamera oder Dateien hinzu, um zu starten.',
      addImages: 'Bilder hinzufügen',
    },
    formatSelection: {
      title: 'Format auswählen',
      infoTitle: 'Formatinformationen',
      infoBody:
        'Wähle das Zielformat nach Kompatibilität und Dateigröße. JPG eignet sich für Fotos, PNG für Transparenz, WebP für Web-Optimierung und HEIC für effiziente iPhone-Speicherung.',
      convertingFrom: 'Ausgangsformat:',
      mixedFormats: 'Gemischte Formate',
      imagesSelected: count => `${count} Bilder ausgewählt`,
      selectOutputFormat: 'Ausgabeformat auswählen:',
    },
    quality: {
      title: 'Qualitätseinstellungen',
      beforeAfter: 'Vorher / Nachher',
      outputSizeEstimate: 'Geschätzte Ausgabegröße',
      estimatedSizeLine: (size, isSmaller) => `${size} (${isSmaller ? 'kleiner' : 'größer'})`,
      deltaLine: (delta, isSmaller) =>
        `${isSmaller ? '↓' : '↑'} ${Math.abs(delta).toFixed(0)}% ${isSmaller ? 'kleiner' : 'größer'} als das Original`,
      advancedOptions: 'Erweiterte Optionen',
      preserveExif: 'EXIF-Daten beibehalten',
      progressiveLoading: 'Progressives Laden',
      stripColorProfile: 'Farbprofil entfernen',
      saveAsPreset: 'Als Preset speichern',
      convertNow: 'Jetzt konvertieren',
    },
    qualitySlider: {
      title: 'Qualität',
      low: 'Niedrig',
      medium: 'Mittel',
      high: 'Hoch',
    },
    history: {
      title: 'Verlauf',
      edit: 'Bearbeiten',
      searchPlaceholder: 'Konvertierungen suchen...',
      filters: {
        all: 'Alle',
        today: 'Heute',
        week: 'Diese Woche',
        month: 'Dieser Monat',
      },
      noConversionsTitle: 'Noch keine Konvertierungen',
      noConversionsDescription:
        'Dein Konvertierungsverlauf wird hier angezeigt. Starte mit deiner ersten Bildkonvertierung.',
      convertAnImage: 'Bild konvertieren',
      deleteSelected: count => `Auswahl löschen (${count})`,
    },
    preview: {
      title: 'Vorschau',
    },
    complete: {
      title: 'Fertig',
      imagesConverted: count => `${count} Bilder konvertiert`,
      conversionComplete: 'Konvertierung abgeschlossen!',
      moreActionsTitle: 'Weitere Aktionen',
      chooseAction: 'Aktion auswählen',
      convertAgain: 'Erneut konvertieren',
      viewOriginal: 'Original ansehen',
      share: 'Teilen',
      save: 'Speichern',
      more: 'Mehr',
      convertAnother: 'Weiteres Bild konvertieren',
    },
    progress: {
      title: 'Wird konvertiert',
      converting: 'Wird konvertiert...',
      completedCount: (completed, total) => `${completed} von ${total} abgeschlossen`,
      steps: {
        readingImage: 'Bild wird gelesen',
        processingData: 'Daten werden verarbeitet',
        applyingCompression: 'Komprimierung wird angewendet',
        savingOutput: 'Ausgabe wird gespeichert',
      },
      cancel: 'Abbrechen',
      cancelTitle: 'Konvertierung abbrechen?',
      cancelBody: 'Der aktuelle Fortschritt geht verloren.',
      keepConverting: 'Weiter konvertieren',
      back: 'Zurück',
      conversionFailed: 'Konvertierung fehlgeschlagen',
    },
    settings: {
      title: 'Einstellungen',
      preferences: 'EINSTELLUNGEN',
      appearance: 'DARSTELLUNG',
      storage: 'SPEICHER',
      about: 'INFO',
      defaultFormat: 'Standardformat',
      defaultQuality: 'Standardqualität',
      preserveMetadata: 'Metadaten behalten',
      autoSaveToPhotos: 'Automatisch in Fotos speichern',
      theme: 'Design',
      cacheSize: 'Cache-Größe',
      clearHistory: 'Verlauf löschen',
      version: 'Version',
      rateSquoze: 'Squoze bewerten',
      privacyPolicy: 'Datenschutz',
      termsOfService: 'Nutzungsbedingungen',
      close: 'Schließen',
      system: 'System',
      light: 'Hell',
      dark: 'Dunkel',
      matchDeviceSettings: 'Geräteeinstellung übernehmen',
      alwaysLightMode: 'Immer heller Modus',
      alwaysDarkMode: 'Immer dunkler Modus',
      clearHistoryTitle: 'Verlauf löschen',
      clearHistoryBody: 'Den gesamten Konvertierungsverlauf löschen?',
      historyItems: count => `${count} Einträge`,
    },
    imagePicker: {
      title: 'Bilder auswählen',
      photoLibrary: 'Fotomediathek',
      photoLibrarySubtitle: 'Ein oder mehrere Fotos auswählen',
      camera: 'Kamera',
      cameraSubtitle: 'Neues Foto aufnehmen',
      files: 'Dateien',
      filesSubtitle: 'Aus lokalen Dateien importieren',
    },
    formatDescriptions: {
      png: 'Verlustfrei • Alpha',
      jpg: 'Universell • Verlustbehaftet',
      webp: 'Modern • Web',
      heic: 'Apple • Effizient',
      bmp: 'Klassisch • Unkomprimiert',
      gif: 'Nur statisches Einzelbild',
      tiff: 'Profi • Verlustfrei',
      pdf: 'Dokumentformat',
    },
    quickActions: {
      'heic-jpg': 'HEIC zu JPG',
      'png-jpg': 'PNG zu JPG',
      'png-webp': 'PNG zu WebP',
      'jpg-png': 'JPG zu PNG',
      batch: 'Stapel',
      favorites: 'Favoriten',
    },
  },
  fr: {
    accessibility: {
      openSettings: 'Ouvrir les réglages',
      openFormatInfo: 'Ouvrir les infos du format',
      goBack: 'Retour',
    },
    tabs: {
      home: 'Accueil',
      convert: 'Convertir',
      history: 'Historique',
      settings: 'Réglages',
    },
    common: {
      close: 'Fermer',
      continue: 'Continuer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      clear: 'Effacer',
      done: 'Terminé',
      open: 'Ouvrir',
      loading: 'Chargement...',
      savedToPhotos: 'Enregistré dans Photos',
      saveFailed: "Échec de l'enregistrement",
      today: "Aujourd'hui",
      yesterday: 'Hier',
      original: 'Original',
      preview: 'Aperçu',
      converted: 'Converti',
      sideBySide: 'Côte à côte',
      larger: 'plus grand',
      smaller: 'plus petit',
      none: 'Aucun',
    },
    splash: {
      tagline: "Convertisseur d'images",
    },
    home: {
      addImage: 'Ajouter une image',
      tapToSelect: 'Touchez pour sélectionner ou glissez-déposez',
      quickActions: 'Actions rapides',
      recentConversions: 'Conversions récentes',
      seeAll: 'Tout voir',
      noRecentTitle: 'Aucune conversion récente',
      noRecentDescription: 'Vos images converties apparaîtront ici',
    },
    convert: {
      title: 'Convertir',
      imagesSelected: count => `${count} image${count > 1 ? 's' : ''} sélectionnée${count > 1 ? 's' : ''}`,
      totalSize: size => `Taille totale : ${size}`,
      selectFormat: 'Choisir le format',
      addMoreImages: "Ajouter d'autres images",
      noImagesTitle: 'Aucune image sélectionnée',
      noImagesDescription: 'Ajoutez des images depuis la photothèque, l’appareil photo ou les fichiers pour commencer.',
      addImages: 'Ajouter des images',
    },
    formatSelection: {
      title: 'Choisir le format',
      infoTitle: 'Informations sur les formats',
      infoBody:
        'Choisissez le format de sortie selon la compatibilité et la taille. JPG convient aux photos, PNG à la transparence, WebP au web, et HEIC à un stockage plus efficace sur iPhone.',
      convertingFrom: 'Conversion depuis :',
      mixedFormats: 'Formats mixtes',
      imagesSelected: count => `${count} images sélectionnées`,
      selectOutputFormat: 'Choisissez le format de sortie :',
    },
    quality: {
      title: 'Réglages de qualité',
      beforeAfter: 'Avant / Après',
      outputSizeEstimate: 'Taille estimée en sortie',
      estimatedSizeLine: (size, isSmaller) => `${size} (${isSmaller ? 'plus petit' : 'plus grand'})`,
      deltaLine: (delta, isSmaller) =>
        `${isSmaller ? '↓' : '↑'} ${Math.abs(delta).toFixed(0)} % ${isSmaller ? 'de moins' : 'de plus'} que l’original`,
      advancedOptions: 'Options avancées',
      preserveExif: 'Conserver les données EXIF',
      progressiveLoading: 'Chargement progressif',
      stripColorProfile: 'Retirer le profil colorimétrique',
      saveAsPreset: 'Enregistrer comme préréglage',
      convertNow: 'Convertir maintenant',
    },
    qualitySlider: {
      title: 'Qualité',
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Élevée',
    },
    history: {
      title: 'Historique',
      edit: 'Modifier',
      searchPlaceholder: 'Rechercher dans les conversions...',
      filters: {
        all: 'Tout',
        today: "Aujourd'hui",
        week: 'Cette semaine',
        month: 'Ce mois-ci',
      },
      noConversionsTitle: 'Aucune conversion pour le moment',
      noConversionsDescription:
        'Votre historique apparaîtra ici. Commencez par convertir votre première image.',
      convertAnImage: 'Convertir une image',
      deleteSelected: count => `Supprimer la sélection (${count})`,
    },
    preview: {
      title: 'Aperçu',
    },
    complete: {
      title: 'Terminé',
      imagesConverted: count => `${count} images converties`,
      conversionComplete: 'Conversion terminée !',
      moreActionsTitle: 'Autres actions',
      chooseAction: 'Choisissez une action',
      convertAgain: 'Convertir à nouveau',
      viewOriginal: "Voir l'original",
      share: 'Partager',
      save: 'Enregistrer',
      more: 'Plus',
      convertAnother: 'Convertir une autre image',
    },
    progress: {
      title: 'Conversion',
      converting: 'Conversion en cours...',
      completedCount: (completed, total) => `${completed} sur ${total} terminées`,
      steps: {
        readingImage: "Lecture de l'image",
        processingData: 'Traitement des données',
        applyingCompression: 'Application de la compression',
        savingOutput: 'Enregistrement du fichier',
      },
      cancel: 'Annuler',
      cancelTitle: 'Annuler la conversion ?',
      cancelBody: 'La progression actuelle sera perdue.',
      keepConverting: 'Continuer',
      back: 'Retour',
      conversionFailed: 'Échec de la conversion',
    },
    settings: {
      title: 'Réglages',
      preferences: 'PRÉFÉRENCES',
      appearance: 'APPARENCE',
      storage: 'STOCKAGE',
      about: 'À PROPOS',
      defaultFormat: 'Format par défaut',
      defaultQuality: 'Qualité par défaut',
      preserveMetadata: 'Conserver les métadonnées',
      autoSaveToPhotos: 'Enregistrer automatiquement dans Photos',
      theme: 'Thème',
      cacheSize: 'Taille du cache',
      clearHistory: "Effacer l'historique",
      version: 'Version',
      rateSquoze: 'Noter Squoze',
      privacyPolicy: 'Politique de confidentialité',
      termsOfService: "Conditions d'utilisation",
      close: 'Fermer',
      system: 'Système',
      light: 'Clair',
      dark: 'Sombre',
      matchDeviceSettings: "Suivre les réglages de l'appareil",
      alwaysLightMode: 'Toujours en mode clair',
      alwaysDarkMode: 'Toujours en mode sombre',
      clearHistoryTitle: "Effacer l'historique",
      clearHistoryBody: 'Supprimer tout l’historique des conversions ?',
      historyItems: count => `${count} éléments`,
    },
    imagePicker: {
      title: 'Sélectionner des images',
      photoLibrary: 'Photothèque',
      photoLibrarySubtitle: 'Choisir une ou plusieurs photos',
      camera: 'Appareil photo',
      cameraSubtitle: 'Prendre une nouvelle photo',
      files: 'Fichiers',
      filesSubtitle: 'Importer depuis les fichiers',
    },
    formatDescriptions: {
      png: 'Sans perte • Alpha',
      jpg: 'Universel • Avec perte',
      webp: 'Moderne • Web',
      heic: 'Apple • Efficace',
      bmp: 'Ancien • Non compressé',
      gif: 'Image fixe uniquement',
      tiff: 'Pro • Sans perte',
      pdf: 'Format document',
    },
    quickActions: {
      'heic-jpg': 'HEIC vers JPG',
      'png-jpg': 'PNG vers JPG',
      'png-webp': 'PNG vers WebP',
      'jpg-png': 'JPG vers PNG',
      batch: 'Lot',
      favorites: 'Favoris',
    },
  },
  'es-MX': {
    accessibility: {
      openSettings: 'Abrir ajustes',
      openFormatInfo: 'Abrir información del formato',
      goBack: 'Volver',
    },
    tabs: {
      home: 'Inicio',
      convert: 'Convertir',
      history: 'Historial',
      settings: 'Ajustes',
    },
    common: {
      close: 'Cerrar',
      continue: 'Continuar',
      save: 'Guardar',
      cancel: 'Cancelar',
      clear: 'Borrar',
      done: 'Listo',
      open: 'Abrir',
      loading: 'Cargando...',
      savedToPhotos: 'Guardado en Fotos',
      saveFailed: 'No se pudo guardar',
      today: 'Hoy',
      yesterday: 'Ayer',
      original: 'Original',
      preview: 'Vista previa',
      converted: 'Convertido',
      sideBySide: 'Lado a lado',
      larger: 'más grande',
      smaller: 'más chico',
      none: 'Ninguno',
    },
    splash: {
      tagline: 'Convertidor de imágenes',
    },
    home: {
      addImage: 'Agregar imagen',
      tapToSelect: 'Toca para elegir o arrastra y suelta',
      quickActions: 'Acciones rápidas',
      recentConversions: 'Conversiones recientes',
      seeAll: 'Ver todo',
      noRecentTitle: 'Aún no hay conversiones recientes',
      noRecentDescription: 'Tus imágenes convertidas aparecerán aquí',
    },
    convert: {
      title: 'Convertir',
      imagesSelected: count => `${count} imagen${count === 1 ? '' : 'es'} seleccionada${count === 1 ? '' : 's'}`,
      totalSize: size => `Tamaño total: ${size}`,
      selectFormat: 'Elegir formato',
      addMoreImages: 'Agregar más imágenes',
      noImagesTitle: 'No hay imágenes seleccionadas',
      noImagesDescription: 'Agrega imágenes desde la galería, la cámara o archivos para empezar a convertir.',
      addImages: 'Agregar imágenes',
    },
    formatSelection: {
      title: 'Elegir formato',
      infoTitle: 'Información del formato',
      infoBody:
        'Elige el formato de salida según compatibilidad y tamaño. JPG va mejor para fotos, PNG para transparencias, WebP para web y HEIC para ahorrar espacio en iPhone.',
      convertingFrom: 'Convirtiendo desde:',
      mixedFormats: 'Formatos mixtos',
      imagesSelected: count => `${count} imágenes seleccionadas`,
      selectOutputFormat: 'Elige el formato de salida:',
    },
    quality: {
      title: 'Ajustes de calidad',
      beforeAfter: 'Antes / Después',
      outputSizeEstimate: 'Estimación del tamaño final',
      estimatedSizeLine: (size, isSmaller) => `${size} (${isSmaller ? 'más chico' : 'más grande'})`,
      deltaLine: (delta, isSmaller) =>
        `${isSmaller ? '↓' : '↑'} ${Math.abs(delta).toFixed(0)}% ${isSmaller ? 'más chico' : 'más grande'} que el original`,
      advancedOptions: 'Opciones avanzadas',
      preserveExif: 'Conservar datos EXIF',
      progressiveLoading: 'Carga progresiva',
      stripColorProfile: 'Quitar perfil de color',
      saveAsPreset: 'Guardar como preset',
      convertNow: 'Convertir ahora',
    },
    qualitySlider: {
      title: 'Calidad',
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
    },
    history: {
      title: 'Historial',
      edit: 'Editar',
      searchPlaceholder: 'Buscar conversiones...',
      filters: {
        all: 'Todas',
        today: 'Hoy',
        week: 'Esta semana',
        month: 'Este mes',
      },
      noConversionsTitle: 'Todavía no hay conversiones',
      noConversionsDescription:
        'Tu historial de conversiones aparecerá aquí. Empieza convirtiendo tu primera imagen.',
      convertAnImage: 'Convertir una imagen',
      deleteSelected: count => `Eliminar seleccionadas (${count})`,
    },
    preview: {
      title: 'Vista previa',
    },
    complete: {
      title: 'Listo',
      imagesConverted: count => `${count} imágenes convertidas`,
      conversionComplete: '¡Conversión terminada!',
      moreActionsTitle: 'Más acciones',
      chooseAction: 'Elige una acción',
      convertAgain: 'Volver a convertir',
      viewOriginal: 'Ver original',
      share: 'Compartir',
      save: 'Guardar',
      more: 'Más',
      convertAnother: 'Convertir otra',
    },
    progress: {
      title: 'Convirtiendo',
      converting: 'Convirtiendo...',
      completedCount: (completed, total) => `${completed} de ${total} completadas`,
      steps: {
        readingImage: 'Leyendo imagen',
        processingData: 'Procesando datos',
        applyingCompression: 'Aplicando compresión',
        savingOutput: 'Guardando resultado',
      },
      cancel: 'Cancelar',
      cancelTitle: '¿Cancelar conversión?',
      cancelBody: 'Se perderá el progreso actual.',
      keepConverting: 'Seguir convirtiendo',
      back: 'Volver',
      conversionFailed: 'La conversión falló',
    },
    settings: {
      title: 'Ajustes',
      preferences: 'PREFERENCIAS',
      appearance: 'APARIENCIA',
      storage: 'ALMACENAMIENTO',
      about: 'ACERCA DE',
      defaultFormat: 'Formato predeterminado',
      defaultQuality: 'Calidad predeterminada',
      preserveMetadata: 'Conservar metadatos',
      autoSaveToPhotos: 'Guardar automáticamente en Fotos',
      theme: 'Tema',
      cacheSize: 'Tamaño de caché',
      clearHistory: 'Borrar historial',
      version: 'Versión',
      rateSquoze: 'Calificar Squoze',
      privacyPolicy: 'Aviso de privacidad',
      termsOfService: 'Términos de servicio',
      close: 'Cerrar',
      system: 'Sistema',
      light: 'Claro',
      dark: 'Oscuro',
      matchDeviceSettings: 'Usar la configuración del dispositivo',
      alwaysLightMode: 'Siempre modo claro',
      alwaysDarkMode: 'Siempre modo oscuro',
      clearHistoryTitle: 'Borrar historial',
      clearHistoryBody: '¿Eliminar todo el historial de conversiones?',
      historyItems: count => `${count} elementos`,
    },
    imagePicker: {
      title: 'Seleccionar imágenes',
      photoLibrary: 'Fototeca',
      photoLibrarySubtitle: 'Selecciona una o varias fotos',
      camera: 'Cámara',
      cameraSubtitle: 'Tomar una foto nueva',
      files: 'Archivos',
      filesSubtitle: 'Importar desde archivos locales',
    },
    formatDescriptions: {
      png: 'Sin pérdida • Alpha',
      jpg: 'Universal • Con pérdida',
      webp: 'Moderno • Web',
      heic: 'Apple • Eficiente',
      bmp: 'Clásico • Sin compresión',
      gif: 'Solo fotograma estático',
      tiff: 'Profesional • Sin pérdida',
      pdf: 'Formato de documento',
    },
    quickActions: {
      'heic-jpg': 'HEIC a JPG',
      'png-jpg': 'PNG a JPG',
      'png-webp': 'PNG a WebP',
      'jpg-png': 'JPG a PNG',
      batch: 'Lote',
      favorites: 'Favoritos',
    },
  },
  'pt-BR': {
    accessibility: {
      openSettings: 'Abrir ajustes',
      openFormatInfo: 'Abrir info do formato',
      goBack: 'Voltar',
    },
    tabs: {
      home: 'Início',
      convert: 'Converter',
      history: 'Histórico',
      settings: 'Ajustes',
    },
    common: {
      close: 'Fechar',
      continue: 'Continuar',
      save: 'Salvar',
      cancel: 'Cancelar',
      clear: 'Limpar',
      done: 'Concluir',
      open: 'Abrir',
      loading: 'Carregando...',
      savedToPhotos: 'Salvo no Fotos',
      saveFailed: 'Não foi possível salvar',
      today: 'Hoje',
      yesterday: 'Ontem',
      original: 'Original',
      preview: 'Prévia',
      converted: 'Convertido',
      sideBySide: 'Lado a lado',
      larger: 'maior',
      smaller: 'menor',
      none: 'Nenhum',
    },
    splash: {
      tagline: 'Conversor de imagens',
    },
    home: {
      addImage: 'Adicionar imagem',
      tapToSelect: 'Toque para escolher ou arraste e solte',
      quickActions: 'Ações rápidas',
      recentConversions: 'Conversões recentes',
      seeAll: 'Ver tudo',
      noRecentTitle: 'Nenhuma conversão recente',
      noRecentDescription: 'Suas imagens convertidas vão aparecer aqui',
    },
    convert: {
      title: 'Converter',
      imagesSelected: count => `${count} imagem${count === 1 ? '' : 'ns'} selecionada${count === 1 ? '' : 's'}`,
      totalSize: size => `Tamanho total: ${size}`,
      selectFormat: 'Selecionar formato',
      addMoreImages: 'Adicionar mais imagens',
      noImagesTitle: 'Nenhuma imagem selecionada',
      noImagesDescription: 'Adicione imagens da galeria, câmera ou arquivos para começar a conversão.',
      addImages: 'Adicionar imagens',
    },
    formatSelection: {
      title: 'Selecionar formato',
      infoTitle: 'Informações do formato',
      infoBody:
        'Escolha o formato de saída considerando compatibilidade e tamanho. JPG é melhor para fotos, PNG para transparência, WebP para uso na web e HEIC para economizar espaço no iPhone.',
      convertingFrom: 'Convertendo de:',
      mixedFormats: 'Formatos mistos',
      imagesSelected: count => `${count} imagens selecionadas`,
      selectOutputFormat: 'Selecione o formato de saída:',
    },
    quality: {
      title: 'Ajustes de qualidade',
      beforeAfter: 'Antes / Depois',
      outputSizeEstimate: 'Estimativa do tamanho final',
      estimatedSizeLine: (size, isSmaller) => `${size} (${isSmaller ? 'menor' : 'maior'})`,
      deltaLine: (delta, isSmaller) =>
        `${isSmaller ? '↓' : '↑'} ${Math.abs(delta).toFixed(0)}% ${isSmaller ? 'menor' : 'maior'} que o original`,
      advancedOptions: 'Opções avançadas',
      preserveExif: 'Manter dados EXIF',
      progressiveLoading: 'Carregamento progressivo',
      stripColorProfile: 'Remover perfil de cor',
      saveAsPreset: 'Salvar como preset',
      convertNow: 'Converter agora',
    },
    qualitySlider: {
      title: 'Qualidade',
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
    },
    history: {
      title: 'Histórico',
      edit: 'Editar',
      searchPlaceholder: 'Buscar conversões...',
      filters: {
        all: 'Todas',
        today: 'Hoje',
        week: 'Esta semana',
        month: 'Este mês',
      },
      noConversionsTitle: 'Ainda não há conversões',
      noConversionsDescription: 'Seu histórico vai aparecer aqui. Comece convertendo sua primeira imagem.',
      convertAnImage: 'Converter uma imagem',
      deleteSelected: count => `Excluir selecionadas (${count})`,
    },
    preview: {
      title: 'Prévia',
    },
    complete: {
      title: 'Concluído',
      imagesConverted: count => `${count} imagens convertidas`,
      conversionComplete: 'Conversão concluída!',
      moreActionsTitle: 'Mais ações',
      chooseAction: 'Escolha uma ação',
      convertAgain: 'Converter de novo',
      viewOriginal: 'Ver original',
      share: 'Compartilhar',
      save: 'Salvar',
      more: 'Mais',
      convertAnother: 'Converter outra',
    },
    progress: {
      title: 'Convertendo',
      converting: 'Convertendo...',
      completedCount: (completed, total) => `${completed} de ${total} concluídas`,
      steps: {
        readingImage: 'Lendo imagem',
        processingData: 'Processando dados',
        applyingCompression: 'Aplicando compressão',
        savingOutput: 'Salvando arquivo',
      },
      cancel: 'Cancelar',
      cancelTitle: 'Cancelar conversão?',
      cancelBody: 'O progresso atual será perdido.',
      keepConverting: 'Continuar convertendo',
      back: 'Voltar',
      conversionFailed: 'Falha na conversão',
    },
    settings: {
      title: 'Ajustes',
      preferences: 'PREFERÊNCIAS',
      appearance: 'APARÊNCIA',
      storage: 'ARMAZENAMENTO',
      about: 'SOBRE',
      defaultFormat: 'Formato padrão',
      defaultQuality: 'Qualidade padrão',
      preserveMetadata: 'Preservar metadados',
      autoSaveToPhotos: 'Salvar automaticamente no Fotos',
      theme: 'Tema',
      cacheSize: 'Tamanho do cache',
      clearHistory: 'Limpar histórico',
      version: 'Versão',
      rateSquoze: 'Avaliar Squoze',
      privacyPolicy: 'Política de privacidade',
      termsOfService: 'Termos de uso',
      close: 'Fechar',
      system: 'Sistema',
      light: 'Claro',
      dark: 'Escuro',
      matchDeviceSettings: 'Seguir o ajuste do aparelho',
      alwaysLightMode: 'Sempre claro',
      alwaysDarkMode: 'Sempre escuro',
      clearHistoryTitle: 'Limpar histórico',
      clearHistoryBody: 'Apagar todo o histórico de conversões?',
      historyItems: count => `${count} itens`,
    },
    imagePicker: {
      title: 'Selecionar imagens',
      photoLibrary: 'Biblioteca de Fotos',
      photoLibrarySubtitle: 'Selecione uma ou mais fotos',
      camera: 'Câmera',
      cameraSubtitle: 'Tirar uma nova foto',
      files: 'Arquivos',
      filesSubtitle: 'Importar de arquivos locais',
    },
    formatDescriptions: {
      png: 'Sem perda • Alpha',
      jpg: 'Universal • Com perda',
      webp: 'Moderno • Web',
      heic: 'Apple • Eficiente',
      bmp: 'Legado • Sem compressão',
      gif: 'Apenas quadro estático',
      tiff: 'Profissional • Sem perda',
      pdf: 'Formato de documento',
    },
    quickActions: {
      'heic-jpg': 'HEIC para JPG',
      'png-jpg': 'PNG para JPG',
      'png-webp': 'PNG para WebP',
      'jpg-png': 'JPG para PNG',
      batch: 'Em lote',
      favorites: 'Favoritos',
    },
  },
  ar: {
    accessibility: {
      openSettings: 'فتح الإعدادات',
      openFormatInfo: 'فتح معلومات الصيغة',
      goBack: 'رجوع',
    },
    tabs: {
      home: 'الرئيسية',
      convert: 'تحويل',
      history: 'السجل',
      settings: 'الإعدادات',
    },
    common: {
      close: 'إغلاق',
      continue: 'متابعة',
      save: 'حفظ',
      cancel: 'إلغاء',
      clear: 'مسح',
      done: 'تم',
      open: 'فتح',
      loading: 'جارٍ التحميل...',
      savedToPhotos: 'تم الحفظ في الصور',
      saveFailed: 'فشل الحفظ',
      today: 'اليوم',
      yesterday: 'أمس',
      original: 'الأصل',
      preview: 'معاينة',
      converted: 'بعد التحويل',
      sideBySide: 'جنبًا إلى جنب',
      larger: 'أكبر',
      smaller: 'أصغر',
      none: 'لا شيء',
    },
    splash: {
      tagline: 'محول الصور',
    },
    home: {
      addImage: 'إضافة صورة',
      tapToSelect: 'اضغط للاختيار أو اسحب وأفلت',
      quickActions: 'إجراءات سريعة',
      recentConversions: 'أحدث التحويلات',
      seeAll: 'عرض الكل',
      noRecentTitle: 'لا توجد تحويلات حديثة',
      noRecentDescription: 'ستظهر صورك المحوّلة هنا',
    },
    convert: {
      title: 'تحويل',
      imagesSelected: count => `تم تحديد ${count} صورة`,
      totalSize: size => `الحجم الإجمالي: ${size}`,
      selectFormat: 'اختيار الصيغة',
      addMoreImages: 'إضافة المزيد من الصور',
      noImagesTitle: 'لم يتم تحديد أي صور',
      noImagesDescription: 'أضف صورًا من المكتبة أو الكاميرا أو الملفات لبدء التحويل.',
      addImages: 'إضافة صور',
    },
    formatSelection: {
      title: 'اختيار الصيغة',
      infoTitle: 'معلومات الصيغ',
      infoBody:
        'اختر صيغة الإخراج حسب التوافق والحجم. JPG مناسب للصور، وPNG للشفافية، وWebP للويب، وHEIC لتوفير المساحة على iPhone.',
      convertingFrom: 'التحويل من:',
      mixedFormats: 'صيغ مختلطة',
      imagesSelected: count => `تم تحديد ${count} صورة`,
      selectOutputFormat: 'اختر صيغة الإخراج:',
    },
    quality: {
      title: 'إعدادات الجودة',
      beforeAfter: 'قبل / بعد',
      outputSizeEstimate: 'تقدير حجم الملف',
      estimatedSizeLine: (size, isSmaller) => `${size} (${isSmaller ? 'أصغر' : 'أكبر'})`,
      deltaLine: (delta, isSmaller) =>
        `${isSmaller ? '↓' : '↑'} ${Math.abs(delta).toFixed(0)}٪ ${isSmaller ? 'أصغر' : 'أكبر'} من الأصل`,
      advancedOptions: 'خيارات متقدمة',
      preserveExif: 'الاحتفاظ ببيانات EXIF',
      progressiveLoading: 'تحميل تدريجي',
      stripColorProfile: 'إزالة ملف تعريف الألوان',
      saveAsPreset: 'حفظ كإعداد مسبق',
      convertNow: 'تحويل الآن',
    },
    qualitySlider: {
      title: 'الجودة',
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
    },
    history: {
      title: 'السجل',
      edit: 'تحرير',
      searchPlaceholder: 'ابحث في التحويلات...',
      filters: {
        all: 'الكل',
        today: 'اليوم',
        week: 'هذا الأسبوع',
        month: 'هذا الشهر',
      },
      noConversionsTitle: 'لا توجد تحويلات بعد',
      noConversionsDescription: 'سيظهر سجل التحويل هنا. ابدأ بتحويل أول صورة.',
      convertAnImage: 'تحويل صورة',
      deleteSelected: count => `حذف المحدد (${count})`,
    },
    preview: {
      title: 'معاينة',
    },
    complete: {
      title: 'اكتمل',
      imagesConverted: count => `تم تحويل ${count} صورة`,
      conversionComplete: 'اكتملت عملية التحويل!',
      moreActionsTitle: 'إجراءات أخرى',
      chooseAction: 'اختر إجراءً',
      convertAgain: 'تحويل مرة أخرى',
      viewOriginal: 'عرض الأصل',
      share: 'مشاركة',
      save: 'حفظ',
      more: 'المزيد',
      convertAnother: 'تحويل صورة أخرى',
    },
    progress: {
      title: 'جارٍ التحويل',
      converting: 'جارٍ التحويل...',
      completedCount: (completed, total) => `اكتمل ${completed} من ${total}`,
      steps: {
        readingImage: 'قراءة الصورة',
        processingData: 'معالجة البيانات',
        applyingCompression: 'تطبيق الضغط',
        savingOutput: 'حفظ الملف',
      },
      cancel: 'إلغاء',
      cancelTitle: 'إلغاء التحويل؟',
      cancelBody: 'سيتم فقدان التقدم الحالي.',
      keepConverting: 'متابعة التحويل',
      back: 'رجوع',
      conversionFailed: 'فشل التحويل',
    },
    settings: {
      title: 'الإعدادات',
      preferences: 'التفضيلات',
      appearance: 'المظهر',
      storage: 'التخزين',
      about: 'حول التطبيق',
      defaultFormat: 'الصيغة الافتراضية',
      defaultQuality: 'الجودة الافتراضية',
      preserveMetadata: 'الاحتفاظ بالبيانات الوصفية',
      autoSaveToPhotos: 'الحفظ التلقائي في الصور',
      theme: 'المظهر',
      cacheSize: 'حجم ذاكرة التخزين المؤقت',
      clearHistory: 'مسح السجل',
      version: 'الإصدار',
      rateSquoze: 'قيّم Squoze',
      privacyPolicy: 'سياسة الخصوصية',
      termsOfService: 'شروط الخدمة',
      close: 'إغلاق',
      system: 'النظام',
      light: 'فاتح',
      dark: 'داكن',
      matchDeviceSettings: 'مطابقة إعدادات الجهاز',
      alwaysLightMode: 'فاتح دائمًا',
      alwaysDarkMode: 'داكن دائمًا',
      clearHistoryTitle: 'مسح السجل',
      clearHistoryBody: 'هل تريد حذف سجل التحويل بالكامل؟',
      historyItems: count => `${count} عنصر`,
    },
    imagePicker: {
      title: 'اختيار الصور',
      photoLibrary: 'مكتبة الصور',
      photoLibrarySubtitle: 'حدد صورة أو أكثر',
      camera: 'الكاميرا',
      cameraSubtitle: 'التقاط صورة جديدة',
      files: 'الملفات',
      filesSubtitle: 'استيراد من الملفات المحلية',
    },
    formatDescriptions: {
      png: 'بدون فقد • يدعم الشفافية',
      jpg: 'شائع • بفقد',
      webp: 'حديث • للويب',
      heic: 'Apple • فعّال',
      bmp: 'تقليدي • غير مضغوط',
      gif: 'إطار ثابت فقط',
      tiff: 'احترافي • بدون فقد',
      pdf: 'صيغة مستند',
    },
    quickActions: {
      'heic-jpg': 'HEIC إلى JPG',
      'png-jpg': 'PNG إلى JPG',
      'png-webp': 'PNG إلى WebP',
      'jpg-png': 'JPG إلى PNG',
      batch: 'دفعة',
      favorites: 'المفضلة',
    },
  },
  ru: {
    accessibility: {
      openSettings: 'Открыть настройки',
      openFormatInfo: 'Открыть информацию о формате',
      goBack: 'Назад',
    },
    tabs: {
      home: 'Главная',
      convert: 'Конвертация',
      history: 'История',
      settings: 'Настройки',
    },
    common: {
      close: 'Закрыть',
      continue: 'Продолжить',
      save: 'Сохранить',
      cancel: 'Отмена',
      clear: 'Очистить',
      done: 'Готово',
      open: 'Открыть',
      loading: 'Загрузка...',
      savedToPhotos: 'Сохранено в Фото',
      saveFailed: 'Не удалось сохранить',
      today: 'Сегодня',
      yesterday: 'Вчера',
      original: 'Оригинал',
      preview: 'Превью',
      converted: 'Результат',
      sideBySide: 'Сравнение',
      larger: 'больше',
      smaller: 'меньше',
      none: 'Нет',
    },
    splash: {
      tagline: 'Конвертер изображений',
    },
    home: {
      addImage: 'Добавить изображение',
      tapToSelect: 'Нажмите, чтобы выбрать, или перетащите файл',
      quickActions: 'Быстрые действия',
      recentConversions: 'Недавние конвертации',
      seeAll: 'Показать все',
      noRecentTitle: 'Пока нет недавних конвертаций',
      noRecentDescription: 'Здесь будут появляться ваши конвертированные изображения',
    },
    convert: {
      title: 'Конвертация',
      imagesSelected: count => `Выбрано изображений: ${count}`,
      totalSize: size => `Общий размер: ${size}`,
      selectFormat: 'Выбрать формат',
      addMoreImages: 'Добавить ещё изображения',
      noImagesTitle: 'Изображения не выбраны',
      noImagesDescription: 'Добавьте изображения из галереи, камеры или файлов, чтобы начать конвертацию.',
      addImages: 'Добавить изображения',
    },
    formatSelection: {
      title: 'Выбор формата',
      infoTitle: 'О форматах',
      infoBody:
        'Выберите формат вывода с учётом совместимости и размера. JPG лучше для фотографий, PNG подходит для прозрачности, WebP удобен для веба, а HEIC экономит место на iPhone.',
      convertingFrom: 'Конвертация из:',
      mixedFormats: 'Смешанные форматы',
      imagesSelected: count => `Выбрано изображений: ${count}`,
      selectOutputFormat: 'Выберите выходной формат:',
    },
    quality: {
      title: 'Настройки качества',
      beforeAfter: 'До / После',
      outputSizeEstimate: 'Оценка размера файла',
      estimatedSizeLine: (size, isSmaller) => `${size} (${isSmaller ? 'меньше' : 'больше'})`,
      deltaLine: (delta, isSmaller) =>
        `${isSmaller ? '↓' : '↑'} ${Math.abs(delta).toFixed(0)}% ${isSmaller ? 'меньше' : 'больше'}, чем оригинал`,
      advancedOptions: 'Дополнительные параметры',
      preserveExif: 'Сохранить данные EXIF',
      progressiveLoading: 'Прогрессивная загрузка',
      stripColorProfile: 'Удалить цветовой профиль',
      saveAsPreset: 'Сохранить как пресет',
      convertNow: 'Конвертировать',
    },
    qualitySlider: {
      title: 'Качество',
      low: 'Низкое',
      medium: 'Среднее',
      high: 'Высокое',
    },
    history: {
      title: 'История',
      edit: 'Изменить',
      searchPlaceholder: 'Поиск по конвертациям...',
      filters: {
        all: 'Все',
        today: 'Сегодня',
        week: 'За неделю',
        month: 'За месяц',
      },
      noConversionsTitle: 'Конвертаций пока нет',
      noConversionsDescription:
        'История конвертаций появится здесь. Начните с первой конвертации изображения.',
      convertAnImage: 'Конвертировать изображение',
      deleteSelected: count => `Удалить выбранное (${count})`,
    },
    preview: {
      title: 'Превью',
    },
    complete: {
      title: 'Готово',
      imagesConverted: count => `Конвертировано изображений: ${count}`,
      conversionComplete: 'Конвертация завершена!',
      moreActionsTitle: 'Другие действия',
      chooseAction: 'Выберите действие',
      convertAgain: 'Конвертировать снова',
      viewOriginal: 'Открыть оригинал',
      share: 'Поделиться',
      save: 'Сохранить',
      more: 'Ещё',
      convertAnother: 'Конвертировать ещё',
    },
    progress: {
      title: 'Идёт конвертация',
      converting: 'Конвертация...',
      completedCount: (completed, total) => `Готово ${completed} из ${total}`,
      steps: {
        readingImage: 'Чтение изображения',
        processingData: 'Обработка данных',
        applyingCompression: 'Применение сжатия',
        savingOutput: 'Сохранение файла',
      },
      cancel: 'Отмена',
      cancelTitle: 'Отменить конвертацию?',
      cancelBody: 'Текущий прогресс будет потерян.',
      keepConverting: 'Продолжить',
      back: 'Назад',
      conversionFailed: 'Ошибка конвертации',
    },
    settings: {
      title: 'Настройки',
      preferences: 'ПАРАМЕТРЫ',
      appearance: 'ОФОРМЛЕНИЕ',
      storage: 'ХРАНИЛИЩЕ',
      about: 'О ПРИЛОЖЕНИИ',
      defaultFormat: 'Формат по умолчанию',
      defaultQuality: 'Качество по умолчанию',
      preserveMetadata: 'Сохранять метаданные',
      autoSaveToPhotos: 'Автосохранение в Фото',
      theme: 'Тема',
      cacheSize: 'Размер кэша',
      clearHistory: 'Очистить историю',
      version: 'Версия',
      rateSquoze: 'Оценить Squoze',
      privacyPolicy: 'Политика конфиденциальности',
      termsOfService: 'Условия использования',
      close: 'Закрыть',
      system: 'Системная',
      light: 'Светлая',
      dark: 'Тёмная',
      matchDeviceSettings: 'Как на устройстве',
      alwaysLightMode: 'Всегда светлая тема',
      alwaysDarkMode: 'Всегда тёмная тема',
      clearHistoryTitle: 'Очистить историю',
      clearHistoryBody: 'Удалить всю историю конвертаций?',
      historyItems: count => `${count} шт.`,
    },
    imagePicker: {
      title: 'Выберите изображения',
      photoLibrary: 'Фотоплёнка',
      photoLibrarySubtitle: 'Выберите одно или несколько фото',
      camera: 'Камера',
      cameraSubtitle: 'Сделать новое фото',
      files: 'Файлы',
      filesSubtitle: 'Импорт из локальных файлов',
    },
    formatDescriptions: {
      png: 'Без потерь • Альфа',
      jpg: 'Универсальный • С потерями',
      webp: 'Современный • Для веба',
      heic: 'Apple • Эффективный',
      bmp: 'Старый формат • Без сжатия',
      gif: 'Только статичный кадр',
      tiff: 'Профессиональный • Без потерь',
      pdf: 'Формат документа',
    },
    quickActions: {
      'heic-jpg': 'HEIC в JPG',
      'png-jpg': 'PNG в JPG',
      'png-webp': 'PNG в WebP',
      'jpg-png': 'JPG в PNG',
      batch: 'Пакетно',
      favorites: 'Избранное',
    },
  },
  it: {
    accessibility: {
      openSettings: 'Apri impostazioni',
      openFormatInfo: 'Apri info formato',
      goBack: 'Indietro',
    },
    tabs: {
      home: 'Home',
      convert: 'Converti',
      history: 'Cronologia',
      settings: 'Impostazioni',
    },
    common: {
      close: 'Chiudi',
      continue: 'Continua',
      save: 'Salva',
      cancel: 'Annulla',
      clear: 'Cancella',
      done: 'Fatto',
      open: 'Apri',
      loading: 'Caricamento...',
      savedToPhotos: 'Salvato in Foto',
      saveFailed: 'Salvataggio non riuscito',
      today: 'Oggi',
      yesterday: 'Ieri',
      original: 'Originale',
      preview: 'Anteprima',
      converted: 'Convertito',
      sideBySide: 'Affiancato',
      larger: 'più grande',
      smaller: 'più piccolo',
      none: 'Nessuno',
    },
    splash: {
      tagline: 'Convertitore immagini',
    },
    home: {
      addImage: 'Aggiungi immagine',
      tapToSelect: 'Tocca per scegliere oppure trascina qui',
      quickActions: 'Azioni rapide',
      recentConversions: 'Conversioni recenti',
      seeAll: 'Vedi tutto',
      noRecentTitle: 'Nessuna conversione recente',
      noRecentDescription: 'Le immagini convertite compariranno qui',
    },
    convert: {
      title: 'Converti',
      imagesSelected: count => `${count} immagin${count === 1 ? 'e selezionata' : 'i selezionate'}`,
      totalSize: size => `Dimensione totale: ${size}`,
      selectFormat: 'Scegli formato',
      addMoreImages: 'Aggiungi altre immagini',
      noImagesTitle: 'Nessuna immagine selezionata',
      noImagesDescription: 'Aggiungi immagini da libreria, fotocamera o file per iniziare.',
      addImages: 'Aggiungi immagini',
    },
    formatSelection: {
      title: 'Scegli formato',
      infoTitle: 'Informazioni sui formati',
      infoBody:
        'Scegli il formato di destinazione in base a compatibilità e dimensioni. JPG è ideale per le foto, PNG per la trasparenza, WebP per il web e HEIC per risparmiare spazio su iPhone.',
      convertingFrom: 'Conversione da:',
      mixedFormats: 'Formati misti',
      imagesSelected: count => `${count} immagini selezionate`,
      selectOutputFormat: 'Scegli il formato di uscita:',
    },
    quality: {
      title: 'Impostazioni qualità',
      beforeAfter: 'Prima / Dopo',
      outputSizeEstimate: 'Stima dimensione finale',
      estimatedSizeLine: (size, isSmaller) => `${size} (${isSmaller ? 'più piccolo' : 'più grande'})`,
      deltaLine: (delta, isSmaller) =>
        `${isSmaller ? '↓' : '↑'} ${Math.abs(delta).toFixed(0)}% ${isSmaller ? 'in meno' : 'in più'} rispetto all’originale`,
      advancedOptions: 'Opzioni avanzate',
      preserveExif: 'Mantieni dati EXIF',
      progressiveLoading: 'Caricamento progressivo',
      stripColorProfile: 'Rimuovi profilo colore',
      saveAsPreset: 'Salva come preset',
      convertNow: 'Converti ora',
    },
    qualitySlider: {
      title: 'Qualità',
      low: 'Bassa',
      medium: 'Media',
      high: 'Alta',
    },
    history: {
      title: 'Cronologia',
      edit: 'Modifica',
      searchPlaceholder: 'Cerca nelle conversioni...',
      filters: {
        all: 'Tutte',
        today: 'Oggi',
        week: 'Questa settimana',
        month: 'Questo mese',
      },
      noConversionsTitle: 'Ancora nessuna conversione',
      noConversionsDescription: 'La cronologia comparirà qui. Inizia convertendo la tua prima immagine.',
      convertAnImage: 'Converti un’immagine',
      deleteSelected: count => `Elimina selezionate (${count})`,
    },
    preview: {
      title: 'Anteprima',
    },
    complete: {
      title: 'Completato',
      imagesConverted: count => `${count} immagini convertite`,
      conversionComplete: 'Conversione completata!',
      moreActionsTitle: 'Altre azioni',
      chooseAction: 'Scegli un’azione',
      convertAgain: 'Converti di nuovo',
      viewOriginal: 'Vedi originale',
      share: 'Condividi',
      save: 'Salva',
      more: 'Altro',
      convertAnother: 'Converti un’altra immagine',
    },
    progress: {
      title: 'Conversione in corso',
      converting: 'Conversione in corso...',
      completedCount: (completed, total) => `${completed} di ${total} completate`,
      steps: {
        readingImage: 'Lettura immagine',
        processingData: 'Elaborazione dati',
        applyingCompression: 'Applicazione compressione',
        savingOutput: 'Salvataggio file',
      },
      cancel: 'Annulla',
      cancelTitle: 'Annullare la conversione?',
      cancelBody: 'L’avanzamento attuale andrà perso.',
      keepConverting: 'Continua conversione',
      back: 'Indietro',
      conversionFailed: 'Conversione non riuscita',
    },
    settings: {
      title: 'Impostazioni',
      preferences: 'PREFERENZE',
      appearance: 'ASPETTO',
      storage: 'ARCHIVIAZIONE',
      about: 'INFO',
      defaultFormat: 'Formato predefinito',
      defaultQuality: 'Qualità predefinita',
      preserveMetadata: 'Mantieni metadati',
      autoSaveToPhotos: 'Salva automaticamente in Foto',
      theme: 'Tema',
      cacheSize: 'Dimensione cache',
      clearHistory: 'Cancella cronologia',
      version: 'Versione',
      rateSquoze: 'Valuta Squoze',
      privacyPolicy: 'Privacy',
      termsOfService: 'Termini di servizio',
      close: 'Chiudi',
      system: 'Sistema',
      light: 'Chiaro',
      dark: 'Scuro',
      matchDeviceSettings: 'Segui le impostazioni del dispositivo',
      alwaysLightMode: 'Sempre chiaro',
      alwaysDarkMode: 'Sempre scuro',
      clearHistoryTitle: 'Cancella cronologia',
      clearHistoryBody: 'Eliminare tutta la cronologia delle conversioni?',
      historyItems: count => `${count} elementi`,
    },
    imagePicker: {
      title: 'Seleziona immagini',
      photoLibrary: 'Libreria foto',
      photoLibrarySubtitle: 'Scegli una o più foto',
      camera: 'Fotocamera',
      cameraSubtitle: 'Scatta una nuova foto',
      files: 'File',
      filesSubtitle: 'Importa da file locali',
    },
    formatDescriptions: {
      png: 'Senza perdita • Alpha',
      jpg: 'Universale • Con perdita',
      webp: 'Moderno • Web',
      heic: 'Apple • Efficiente',
      bmp: 'Storico • Non compresso',
      gif: 'Solo fotogramma statico',
      tiff: 'Professionale • Senza perdita',
      pdf: 'Formato documento',
    },
    quickActions: {
      'heic-jpg': 'HEIC in JPG',
      'png-jpg': 'PNG in JPG',
      'png-webp': 'PNG in WebP',
      'jpg-png': 'JPG in PNG',
      batch: 'Batch',
      favorites: 'Preferiti',
    },
  },
  hi: {
    accessibility: {
      openSettings: 'सेटिंग्स खोलें',
      openFormatInfo: 'फ़ॉर्मैट जानकारी खोलें',
      goBack: 'वापस जाएँ',
    },
    tabs: {
      home: 'होम',
      convert: 'कन्वर्ट',
      history: 'हिस्ट्री',
      settings: 'सेटिंग्स',
    },
    common: {
      close: 'बंद करें',
      continue: 'जारी रखें',
      save: 'सेव करें',
      cancel: 'रद्द करें',
      clear: 'साफ़ करें',
      done: 'हो गया',
      open: 'खोलें',
      loading: 'लोड हो रहा है...',
      savedToPhotos: 'फ़ोटो में सेव हो गया',
      saveFailed: 'सेव नहीं हो सका',
      today: 'आज',
      yesterday: 'कल',
      original: 'ओरिजिनल',
      preview: 'प्रीव्यू',
      converted: 'कन्वर्टेड',
      sideBySide: 'साथ-साथ',
      larger: 'बड़ा',
      smaller: 'छोटा',
      none: 'कोई नहीं',
    },
    splash: {
      tagline: 'इमेज कन्वर्टर',
    },
    home: {
      addImage: 'इमेज जोड़ें',
      tapToSelect: 'चुनने के लिए टैप करें या ड्रैग-ड्रॉप करें',
      quickActions: 'क्विक ऐक्शन',
      recentConversions: 'हाल की कन्वर्ज़न',
      seeAll: 'सब देखें',
      noRecentTitle: 'अभी तक कोई हाल की कन्वर्ज़न नहीं',
      noRecentDescription: 'आपकी कन्वर्ट की गई इमेज यहाँ दिखाई देंगी',
    },
    convert: {
      title: 'कन्वर्ट',
      imagesSelected: count => `${count} इमेज चुनी गई`,
      totalSize: size => `कुल साइज़: ${size}`,
      selectFormat: 'फ़ॉर्मैट चुनें',
      addMoreImages: 'और इमेज जोड़ें',
      noImagesTitle: 'कोई इमेज चुनी नहीं गई',
      noImagesDescription: 'शुरू करने के लिए लाइब्रेरी, कैमरा या फ़ाइलों से इमेज जोड़ें।',
      addImages: 'इमेज जोड़ें',
    },
    formatSelection: {
      title: 'फ़ॉर्मैट चुनें',
      infoTitle: 'फ़ॉर्मैट जानकारी',
      infoBody:
        'आउटपुट फ़ॉर्मैट को कम्पैटिबिलिटी और साइज़ के हिसाब से चुनें। JPG फ़ोटो के लिए अच्छा है, PNG ट्रांसपैरेंसी के लिए, WebP वेब के लिए और HEIC iPhone पर कम जगह लेता है।',
      convertingFrom: 'यहाँ से कन्वर्ट हो रहा है:',
      mixedFormats: 'मिक्स्ड फ़ॉर्मैट',
      imagesSelected: count => `${count} इमेज चुनी गई`,
      selectOutputFormat: 'आउटपुट फ़ॉर्मैट चुनें:',
    },
    quality: {
      title: 'क्वालिटी सेटिंग्स',
      beforeAfter: 'पहले / बाद में',
      outputSizeEstimate: 'आउटपुट साइज़ का अनुमान',
      estimatedSizeLine: (size, isSmaller) => `${size} (${isSmaller ? 'छोटा' : 'बड़ा'})`,
      deltaLine: (delta, isSmaller) =>
        `${isSmaller ? '↓' : '↑'} ओरिजिनल से ${Math.abs(delta).toFixed(0)}% ${isSmaller ? 'छोटा' : 'बड़ा'}`,
      advancedOptions: 'एडवांस्ड ऑप्शन',
      preserveExif: 'EXIF डेटा रखें',
      progressiveLoading: 'प्रोग्रेसिव लोडिंग',
      stripColorProfile: 'कलर प्रोफ़ाइल हटाएँ',
      saveAsPreset: 'प्रीसेट के रूप में सेव करें',
      convertNow: 'अभी कन्वर्ट करें',
    },
    qualitySlider: {
      title: 'क्वालिटी',
      low: 'लो',
      medium: 'मीडियम',
      high: 'हाई',
    },
    history: {
      title: 'हिस्ट्री',
      edit: 'एडिट',
      searchPlaceholder: 'कन्वर्ज़न खोजें...',
      filters: {
        all: 'सभी',
        today: 'आज',
        week: 'इस हफ्ते',
        month: 'इस महीने',
      },
      noConversionsTitle: 'अभी तक कोई कन्वर्ज़न नहीं',
      noConversionsDescription: 'आपकी कन्वर्ज़न हिस्ट्री यहाँ दिखाई देगी। अपनी पहली इमेज कन्वर्ट करके शुरू करें।',
      convertAnImage: 'इमेज कन्वर्ट करें',
      deleteSelected: count => `चुनी हुई हटाएँ (${count})`,
    },
    preview: {
      title: 'प्रीव्यू',
    },
    complete: {
      title: 'पूरा हुआ',
      imagesConverted: count => `${count} इमेज कन्वर्ट हो गईं`,
      conversionComplete: 'कन्वर्ज़न पूरी हो गई!',
      moreActionsTitle: 'और विकल्प',
      chooseAction: 'कोई विकल्प चुनें',
      convertAgain: 'फिर से कन्वर्ट करें',
      viewOriginal: 'ओरिजिनल देखें',
      share: 'शेयर',
      save: 'सेव',
      more: 'और',
      convertAnother: 'एक और इमेज कन्वर्ट करें',
    },
    progress: {
      title: 'कन्वर्ट हो रहा है',
      converting: 'कन्वर्ट हो रहा है...',
      completedCount: (completed, total) => `${total} में से ${completed} पूरे`,
      steps: {
        readingImage: 'इमेज पढ़ी जा रही है',
        processingData: 'डेटा प्रोसेस हो रहा है',
        applyingCompression: 'कंप्रेशन लागू हो रहा है',
        savingOutput: 'आउटपुट सेव हो रहा है',
      },
      cancel: 'रद्द करें',
      cancelTitle: 'कन्वर्ज़न रद्द करें?',
      cancelBody: 'मौजूदा प्रोग्रेस खो जाएगी।',
      keepConverting: 'कन्वर्ट जारी रखें',
      back: 'वापस',
      conversionFailed: 'कन्वर्ज़न फ़ेल हो गई',
    },
    settings: {
      title: 'सेटिंग्स',
      preferences: 'पसंद',
      appearance: 'दिखावट',
      storage: 'स्टोरेज',
      about: 'जानकारी',
      defaultFormat: 'डिफ़ॉल्ट फ़ॉर्मैट',
      defaultQuality: 'डिफ़ॉल्ट क्वालिटी',
      preserveMetadata: 'मेटाडेटा रखें',
      autoSaveToPhotos: 'फ़ोटो में अपने-आप सेव करें',
      theme: 'थीम',
      cacheSize: 'कैश साइज़',
      clearHistory: 'हिस्ट्री साफ़ करें',
      version: 'वर्ज़न',
      rateSquoze: 'Squoze को रेट करें',
      privacyPolicy: 'प्राइवेसी पॉलिसी',
      termsOfService: 'सेवा की शर्तें',
      close: 'बंद करें',
      system: 'सिस्टम',
      light: 'लाइट',
      dark: 'डार्क',
      matchDeviceSettings: 'डिवाइस सेटिंग्स के अनुसार',
      alwaysLightMode: 'हमेशा लाइट मोड',
      alwaysDarkMode: 'हमेशा डार्क मोड',
      clearHistoryTitle: 'हिस्ट्री साफ़ करें',
      clearHistoryBody: 'क्या आप पूरी कन्वर्ज़न हिस्ट्री हटाना चाहते हैं?',
      historyItems: count => `${count} आइटम`,
    },
    imagePicker: {
      title: 'इमेज चुनें',
      photoLibrary: 'फ़ोटो लाइब्रेरी',
      photoLibrarySubtitle: 'एक या ज़्यादा फ़ोटो चुनें',
      camera: 'कैमरा',
      cameraSubtitle: 'नई फ़ोटो लें',
      files: 'फ़ाइलें',
      filesSubtitle: 'लोकल फ़ाइलों से इम्पोर्ट करें',
    },
    formatDescriptions: {
      png: 'लॉसलेस • अल्फ़ा',
      jpg: 'यूनिवर्सल • लॉसी',
      webp: 'मॉडर्न • वेब',
      heic: 'Apple • जगह बचाने वाला',
      bmp: 'पुराना • बिना कंप्रेशन',
      gif: 'सिर्फ़ स्थिर फ़्रेम',
      tiff: 'प्रोफेशनल • लॉसलेस',
      pdf: 'डॉक्यूमेंट फ़ॉर्मैट',
    },
    quickActions: {
      'heic-jpg': 'HEIC से JPG',
      'png-jpg': 'PNG से JPG',
      'png-webp': 'PNG से WebP',
      'jpg-png': 'JPG से PNG',
      batch: 'बैच',
      favorites: 'फेवरिट',
    },
  },
  fil: {
    accessibility: {
      openSettings: 'Buksan ang settings',
      openFormatInfo: 'Buksan ang info ng format',
      goBack: 'Bumalik',
    },
    tabs: {
      home: 'Home',
      convert: 'Convert',
      history: 'History',
      settings: 'Settings',
    },
    common: {
      close: 'Isara',
      continue: 'Magpatuloy',
      save: 'I-save',
      cancel: 'Kanselahin',
      clear: 'I-clear',
      done: 'Tapos',
      open: 'Buksan',
      loading: 'Naglo-load...',
      savedToPhotos: 'Na-save sa Photos',
      saveFailed: 'Hindi na-save',
      today: 'Ngayon',
      yesterday: 'Kahapon',
      original: 'Original',
      preview: 'Preview',
      converted: 'Converted',
      sideBySide: 'Magkatabi',
      larger: 'mas malaki',
      smaller: 'mas maliit',
      none: 'Wala',
    },
    splash: {
      tagline: 'Image converter',
    },
    home: {
      addImage: 'Magdagdag ng image',
      tapToSelect: 'I-tap para pumili o i-drag at i-drop',
      quickActions: 'Quick actions',
      recentConversions: 'Mga huling conversion',
      seeAll: 'Tingnan lahat',
      noRecentTitle: 'Wala pang recent conversions',
      noRecentDescription: 'Dito lalabas ang mga na-convert mong image',
    },
    convert: {
      title: 'Convert',
      imagesSelected: count => `${count} image ang napili`,
      totalSize: size => `Kabuuang laki: ${size}`,
      selectFormat: 'Pumili ng format',
      addMoreImages: 'Magdagdag pa ng image',
      noImagesTitle: 'Walang napiling image',
      noImagesDescription: 'Magdagdag ng images mula sa library, camera, o files para makapagsimula.',
      addImages: 'Magdagdag ng images',
    },
    formatSelection: {
      title: 'Pumili ng format',
      infoTitle: 'Impormasyon ng format',
      infoBody:
        'Piliin ang output format ayon sa compatibility at laki ng file. Pinakamainam ang JPG para sa photos, PNG para sa transparency, WebP para sa web, at HEIC para makatipid ng storage sa iPhone.',
      convertingFrom: 'Kinokonvert mula sa:',
      mixedFormats: 'Halo-halong format',
      imagesSelected: count => `${count} images ang napili`,
      selectOutputFormat: 'Piliin ang output format:',
    },
    quality: {
      title: 'Quality settings',
      beforeAfter: 'Bago / Pagkatapos',
      outputSizeEstimate: 'Tantiyang laki ng output',
      estimatedSizeLine: (size, isSmaller) => `${size} (${isSmaller ? 'mas maliit' : 'mas malaki'})`,
      deltaLine: (delta, isSmaller) =>
        `${isSmaller ? '↓' : '↑'} ${Math.abs(delta).toFixed(0)}% ${isSmaller ? 'mas maliit' : 'mas malaki'} kaysa original`,
      advancedOptions: 'Advanced options',
      preserveExif: 'Panatilihin ang EXIF data',
      progressiveLoading: 'Progressive loading',
      stripColorProfile: 'Tanggalin ang color profile',
      saveAsPreset: 'I-save bilang preset',
      convertNow: 'Convert na',
    },
    qualitySlider: {
      title: 'Quality',
      low: 'Mababa',
      medium: 'Katamtaman',
      high: 'Mataas',
    },
    history: {
      title: 'History',
      edit: 'I-edit',
      searchPlaceholder: 'Maghanap ng conversions...',
      filters: {
        all: 'Lahat',
        today: 'Ngayon',
        week: 'Ngayong linggo',
        month: 'Ngayong buwan',
      },
      noConversionsTitle: 'Wala pang conversions',
      noConversionsDescription: 'Dito lalabas ang history ng conversion mo. Simulan sa unang image mo.',
      convertAnImage: 'Mag-convert ng image',
      deleteSelected: count => `Burahin ang napili (${count})`,
    },
    preview: {
      title: 'Preview',
    },
    complete: {
      title: 'Tapos',
      imagesConverted: count => `${count} images ang na-convert`,
      conversionComplete: 'Tapos na ang conversion!',
      moreActionsTitle: 'Iba pang actions',
      chooseAction: 'Pumili ng action',
      convertAgain: 'Mag-convert ulit',
      viewOriginal: 'Tingnan ang original',
      share: 'I-share',
      save: 'I-save',
      more: 'Higit pa',
      convertAnother: 'Mag-convert ng iba pa',
    },
    progress: {
      title: 'Nagko-convert',
      converting: 'Nagko-convert...',
      completedCount: (completed, total) => `${completed} sa ${total} ang tapos`,
      steps: {
        readingImage: 'Binabasa ang image',
        processingData: 'Pinoproseso ang data',
        applyingCompression: 'Ina-apply ang compression',
        savingOutput: 'Sine-save ang output',
      },
      cancel: 'Kanselahin',
      cancelTitle: 'Kanselahin ang conversion?',
      cancelBody: 'Mawawala ang kasalukuyang progreso.',
      keepConverting: 'Ituloy ang conversion',
      back: 'Bumalik',
      conversionFailed: 'Hindi natuloy ang conversion',
    },
    settings: {
      title: 'Settings',
      preferences: 'PREFERENCES',
      appearance: 'APPEARANCE',
      storage: 'STORAGE',
      about: 'ABOUT',
      defaultFormat: 'Default format',
      defaultQuality: 'Default quality',
      preserveMetadata: 'Panatilihin ang metadata',
      autoSaveToPhotos: 'Awtomatikong i-save sa Photos',
      theme: 'Theme',
      cacheSize: 'Laki ng cache',
      clearHistory: 'Burahin ang history',
      version: 'Version',
      rateSquoze: 'I-rate ang Squoze',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      close: 'Isara',
      system: 'System',
      light: 'Light',
      dark: 'Dark',
      matchDeviceSettings: 'Sumunod sa settings ng device',
      alwaysLightMode: 'Laging light mode',
      alwaysDarkMode: 'Laging dark mode',
      clearHistoryTitle: 'Burahin ang history',
      clearHistoryBody: 'Burahin ang buong history ng conversion?',
      historyItems: count => `${count} items`,
    },
    imagePicker: {
      title: 'Pumili ng images',
      photoLibrary: 'Photo Library',
      photoLibrarySubtitle: 'Pumili ng isa o higit pang photo',
      camera: 'Camera',
      cameraSubtitle: 'Kumuha ng bagong photo',
      files: 'Files',
      filesSubtitle: 'Mag-import mula sa local files',
    },
    formatDescriptions: {
      png: 'Lossless • Alpha',
      jpg: 'Universal • Lossy',
      webp: 'Modern • Web',
      heic: 'Apple • Tipid sa storage',
      bmp: 'Legacy • Uncompressed',
      gif: 'Static frame lang',
      tiff: 'Professional • Lossless',
      pdf: 'Document format',
    },
    quickActions: {
      'heic-jpg': 'HEIC to JPG',
      'png-jpg': 'PNG to JPG',
      'png-webp': 'PNG to WebP',
      'jpg-png': 'JPG to PNG',
      batch: 'Batch',
      favorites: 'Favorites',
    },
  },
};

export const getStrings = (
  localePreference: string | AppLocalePreference = getCurrentLocalePreference(),
) =>
  translations[getAppLocale(localePreference as AppLocalePreference)];

type I18nContextValue = {
  localePreference: AppLocalePreference;
  locale: AppLocale;
  strings: AppStrings;
};

const I18nContext = createContext<I18nContextValue>({
  localePreference: 'system',
  locale: 'en',
  strings: translations.en,
});

export const I18nProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const localePreference = useAppStore(state => state.settings.locale ?? 'system');
  const value = useMemo<I18nContextValue>(() => {
    const locale = getAppLocale(localePreference);
    return {
      localePreference,
      locale,
      strings: translations[locale],
    };
  }, [localePreference]);

  return React.createElement(I18nContext.Provider, { value }, children);
};

export const useStrings = () => useContext(I18nContext).strings;

export const useLocale = () => useContext(I18nContext);

export const getFormatDescription = (
  format: FormatId,
  localePreference: string | AppLocalePreference = getCurrentLocalePreference(),
) => getStrings(localePreference).formatDescriptions[format];

export const getQuickActionLabel = (
  id: QuickActionId,
  localePreference: string | AppLocalePreference = getCurrentLocalePreference(),
) => getStrings(localePreference).quickActions[id];

const languageSettingLabels: Record<AppLocale, string> = {
  en: 'Language',
  'zh-Hans': '语言',
  ja: '言語',
  ko: '언어',
  de: 'Sprache',
  fr: 'Langue',
  'es-MX': 'Idioma',
  'pt-BR': 'Idioma',
  ar: 'اللغة',
  ru: 'Язык',
  it: 'Lingua',
  hi: 'भाषा',
  fil: 'Wika',
};

const systemLanguageLabels: Record<AppLocale, string> = {
  en: 'System Default',
  'zh-Hans': '跟随系统',
  ja: 'システムに合わせる',
  ko: '시스템 기본값',
  de: 'Systemstandard',
  fr: 'Par défaut du système',
  'es-MX': 'Predeterminado del sistema',
  'pt-BR': 'Padrão do sistema',
  ar: 'افتراضي النظام',
  ru: 'Как в системе',
  it: 'Predefinita di sistema',
  hi: 'सिस्टम डिफ़ॉल्ट',
  fil: 'Default ng system',
};

const localeNativeNames: Record<AppLocale, string> = {
  en: 'English',
  'zh-Hans': '简体中文',
  ja: '日本語',
  ko: '한국어',
  de: 'Deutsch',
  fr: 'Français',
  'es-MX': 'Español (México)',
  'pt-BR': 'Português (Brasil)',
  ar: 'العربية',
  ru: 'Русский',
  it: 'Italiano',
  hi: 'हिन्दी',
  fil: 'Filipino',
};

export const getLanguageSettingLabel = (
  localePreference: string | AppLocalePreference = getCurrentLocalePreference(),
) =>
  languageSettingLabels[getAppLocale(localePreference)];

export const getSystemLanguageLabel = (
  localePreference: string | AppLocalePreference = getCurrentLocalePreference(),
) =>
  systemLanguageLabels[getAppLocale(localePreference)];

export const getLocaleNativeName = (locale: AppLocale) => localeNativeNames[locale];

export const formatLocalizedNumber = (
  value: number,
  localePreference: string | AppLocalePreference = getCurrentLocalePreference(),
) => new Intl.NumberFormat(getAppLocale(localePreference as AppLocalePreference)).format(value);

export const formatLocalizedPercent = (
  value: number,
  localePreference: string | AppLocalePreference = getCurrentLocalePreference(),
) => `${formatLocalizedNumber(Math.abs(Math.round(value)), localePreference)}%`;
