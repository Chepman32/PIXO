import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { ArrowRight, Sparkle } from 'phosphor-react-native';
import { RootStackParamList } from '../../app/navigation/types';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useAppStore } from '../../app/providers/store/useAppStore';
import { useStrings } from '../../shared/lib/i18n';
import { Button } from '../../shared/ui/Button';
import { haptic } from '../../shared/lib/haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface OnboardingPage {
  id: 'compatibility' | 'control' | 'flow';
  eyebrow: string;
  title: string;
  description: string;
  chips: [string, string];
}

const PAGE_OPEN_VELOCITY = 2.7;
const PAGE_CLOSE_VELOCITY = -2.4;
const DISPLAY_FONT = Platform.select({
  ios: 'AvenirNext-Heavy',
  default: undefined,
});
const BODY_FONT = Platform.select({
  ios: 'AvenirNext-Medium',
  default: undefined,
});

const springConfig = (toValue: number, velocity: number) => ({
  toValue,
  velocity,
  damping: 18,
  mass: 0.94,
  stiffness: 180,
  overshootClamping: false,
  restDisplacementThreshold: 0.4,
  restSpeedThreshold: 0.4,
  useNativeDriver: true as const,
});

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const strings = useStrings();
  const { width, height } = useWindowDimensions();
  const reduceMotion = useAppStore(state => state.settings.reduceMotion ?? false);
  const setSettings = useAppStore(state => state.setSettings);
  const [currentIndex, setCurrentIndex] = useState(0);
  const pageProgress = useRef(new Animated.Value(0)).current;
  const entranceProgress = useRef(new Animated.Value(0)).current;
  const currentIndexRef = useRef(0);
  const pages: OnboardingPage[] = [
    { id: 'compatibility', ...strings.onboarding.pages.compatibility },
    { id: 'control', ...strings.onboarding.pages.control },
    { id: 'flow', ...strings.onboarding.pages.flow },
  ];

  useEffect(() => {
    const animation = reduceMotion
      ? Animated.timing(entranceProgress, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        })
      : Animated.spring(entranceProgress, springConfig(1, 2.1));

    animation.start();

    return () => {
      animation.stop();
    };
  }, [entranceProgress, reduceMotion]);

  const completeOnboarding = () => {
    setSettings({ onboardingCompleted: true });
    navigation.replace('MainTabs');
  };

  const animateToIndex = (nextIndex: number, velocity?: number, force = false) => {
    if (nextIndex < 0 || nextIndex >= pages.length) {
      return;
    }

    if (!force && nextIndex === currentIndexRef.current) {
      return;
    }

    const previousIndex = currentIndexRef.current;
    const direction = nextIndex >= previousIndex ? 1 : -1;
    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);

    const animation = reduceMotion
      ? Animated.timing(pageProgress, {
          toValue: nextIndex,
          duration: 220,
          useNativeDriver: true,
        })
      : Animated.spring(
          pageProgress,
          springConfig(
            nextIndex,
            velocity ??
              (nextIndex === previousIndex
                ? 0
                : direction > 0
                  ? PAGE_OPEN_VELOCITY
                  : PAGE_CLOSE_VELOCITY),
          ),
        );

    animation.start();
  };

  const handleContinue = () => {
    if (currentIndex === pages.length - 1) {
      completeOnboarding();
      return;
    }

    animateToIndex(currentIndex + 1);
  };

  const trackTranslateX = pageProgress.interpolate({
    inputRange: pages.map((_, index) => index),
    outputRange: pages.map((_, index) => -index * width),
  });

  const headerOpacity = entranceProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const headerTranslateY = entranceProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 0],
  });
  const footerTranslateY = entranceProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });
  const footerOpacity = entranceProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const topOrbTranslateX = pageProgress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [-32, 36, -8],
  });
  const topOrbTranslateY = pageProgress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [-10, -24, 12],
  });
  const topOrbScale = pageProgress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 1.16, 0.9],
  });
  const bottomOrbTranslateX = pageProgress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [24, -16, 38],
  });
  const bottomOrbTranslateY = pageProgress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [8, -18, -10],
  });

  const compactLayout = height < 880;
  const contentWidth = Math.min(width - 40, 430);
  const illustrationHeight = compactLayout
    ? Math.min(height * 0.3, 272)
    : Math.min(height * 0.36, 330);
  const gradientColors = theme.isDark
    ? ['#070A12', '#10182A', '#18192E']
    : ['#F8FBFF', '#EEF5FF', '#FFF5EE'];
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 8,
    onPanResponderGrant: () => {
      pageProgress.stopAnimation();
    },
    onPanResponderMove: (_, gestureState) => {
      const rawProgress = currentIndexRef.current - gestureState.dx / Math.max(width, 1);
      const clampedProgress = Math.max(0, Math.min(pages.length - 1, rawProgress));
      pageProgress.setValue(clampedProgress);
    },
    onPanResponderRelease: (_, gestureState) => {
      let nextIndex = currentIndexRef.current;

      if (Math.abs(gestureState.dx) > width * 0.18 || Math.abs(gestureState.vx) > 0.35) {
        nextIndex = currentIndexRef.current + (gestureState.dx < 0 ? 1 : -1);
      }

      nextIndex = Math.max(0, Math.min(pages.length - 1, nextIndex));
      const swipeVelocity = Math.max(-3.2, Math.min(3.2, -gestureState.vx * 2.6));
      animateToIndex(nextIndex, swipeVelocity || undefined, true);
    },
    onPanResponderTerminate: () => {
      animateToIndex(currentIndexRef.current, undefined, true);
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient colors={gradientColors} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={StyleSheet.absoluteFill} />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb,
          styles.orbTop,
          {
            backgroundColor: theme.colors.primary,
            opacity: theme.isDark ? 0.18 : 0.12,
            transform: [
              { translateX: topOrbTranslateX },
              { translateY: topOrbTranslateY },
              { scale: topOrbScale },
            ],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb,
          styles.orbBottom,
          {
            backgroundColor: theme.colors.accent,
            opacity: theme.isDark ? 0.14 : 0.11,
            transform: [
              { translateX: bottomOrbTranslateX },
              { translateY: bottomOrbTranslateY },
            ],
          },
        ]}
      />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <Animated.View
          style={[
            styles.topBar,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          <View
            style={[
              styles.brandPill,
              {
                backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)',
                borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(18,24,42,0.08)',
              },
            ]}
          >
            <Sparkle color={theme.colors.primary} size={14} weight="fill" />
            <Text style={[styles.brandText, { color: theme.colors.textPrimary }]}>Squoze</Text>
          </View>

          <Pressable
            hitSlop={10}
            onPress={() => {
              haptic.light();
              completeOnboarding();
            }}
            style={({ pressed }) => [styles.skipButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
              {strings.onboarding.skip}
            </Text>
          </Pressable>
        </Animated.View>

        <View {...panResponder.panHandlers} style={styles.trackViewport}>
          <Animated.View
            style={[
              styles.track,
              {
                width: width * pages.length,
                transform: [{ translateX: trackTranslateX }],
              },
            ]}
          >
            {pages.map((page, index) => {
              const slideOpacity = pageProgress.interpolate({
                inputRange: [index - 0.7, index, index + 0.7],
                outputRange: [0.36, 1, 0.36],
                extrapolate: 'clamp',
              });
              const illustrationTranslateY = pageProgress.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [18, 0, 18],
                extrapolate: 'clamp',
              });
              const illustrationScale = pageProgress.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [0.92, 1, 0.92],
                extrapolate: 'clamp',
              });
              const copyTranslateY = pageProgress.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [20, 0, 20],
                extrapolate: 'clamp',
              });

              return (
                <View key={page.id} style={[styles.slide, { width }]}>
                  <Animated.View
                    style={[
                      styles.heroCard,
                      {
                        backgroundColor: theme.isDark
                          ? 'rgba(19, 23, 38, 0.76)'
                          : 'rgba(255,255,255,0.78)',
                        borderColor: theme.isDark
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(18,24,42,0.08)',
                        height: illustrationHeight,
                        opacity: slideOpacity,
                        transform: [
                          { translateY: illustrationTranslateY },
                          { scale: illustrationScale },
                        ],
                        width: contentWidth,
                      },
                    ]}
                  >
                    <OnboardingIllustration
                      accent={theme.colors.accent}
                      id={page.id}
                      primary={theme.colors.primary}
                      secondary={theme.colors.primaryLight}
                      textColor={theme.colors.textPrimary}
                    />
                  </Animated.View>

                  <Animated.View
                    style={[
                      styles.copyBlock,
                      {
                        marginTop: compactLayout ? 20 : 26,
                        opacity: slideOpacity,
                        transform: [{ translateY: copyTranslateY }],
                        width: contentWidth,
                      },
                    ]}
                  >
                    <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>{page.eyebrow}</Text>
                    <Text
                      style={[
                        compactLayout ? styles.titleCompact : styles.title,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {page.title}
                    </Text>
                    <Text
                      style={[
                        compactLayout ? styles.descriptionCompact : styles.description,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {page.description}
                    </Text>

                    <View style={[styles.chipRow, compactLayout && styles.chipRowCompact]}>
                      {page.chips.map(chip => (
                        <View
                          key={chip}
                          style={[
                            styles.chip,
                            compactLayout && styles.chipCompact,
                            {
                              backgroundColor: theme.isDark
                                ? 'rgba(255,255,255,0.06)'
                                : 'rgba(255,255,255,0.74)',
                              borderColor: theme.isDark
                                ? 'rgba(255,255,255,0.08)'
                                : 'rgba(18,24,42,0.08)',
                            },
                          ]}
                        >
                          <Text style={[styles.chipText, { color: theme.colors.textPrimary }]}>{chip}</Text>
                        </View>
                      ))}
                    </View>
                  </Animated.View>
                </View>
              );
            })}
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.footer,
            {
              opacity: footerOpacity,
              transform: [{ translateY: footerTranslateY }],
            },
          ]}
        >
          <View style={styles.progressRow}>
            <View style={styles.dots}>
              {pages.map((page, index) => {
                const indicatorScaleX = pageProgress.interpolate({
                  inputRange: [index - 1, index, index + 1],
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: 'clamp',
                });
                const indicatorOpacity = pageProgress.interpolate({
                  inputRange: [index - 1, index, index + 1],
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: 'clamp',
                });

                return (
                  <Pressable
                    key={page.id}
                    hitSlop={8}
                    onPress={() => {
                      haptic.selection();
                      animateToIndex(index);
                    }}
                  >
                    <Animated.View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: index === currentIndex ? theme.colors.primary : theme.colors.border,
                          opacity: indicatorOpacity,
                          transform: [{ scaleX: indicatorScaleX }],
                        },
                      ]}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Button
            fullWidth
            label={
              currentIndex === pages.length - 1
                ? strings.onboarding.openApp
                : strings.common.continue
            }
            onPress={handleContinue}
            rightIcon={
              currentIndex === pages.length - 1 ? undefined : (
                <ArrowRight color={theme.colors.white} size={18} />
              )
            }
            size="large"
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

interface IllustrationProps {
  id: OnboardingPage['id'];
  primary: string;
  secondary: string;
  accent: string;
  textColor: string;
}

const OnboardingIllustration: React.FC<IllustrationProps> = ({
  id,
  primary,
  secondary,
  accent,
  textColor,
}) => {
  const strings = useStrings();

  if (id === 'compatibility') {
    return (
      <Svg height="100%" viewBox="0 0 320 280" width="100%">
        <Defs>
          <SvgLinearGradient id="compat-bg" x1="0%" x2="100%" y1="0%" y2="100%">
            <Stop offset="0%" stopColor={primary} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={accent} stopOpacity="0.1" />
          </SvgLinearGradient>
        </Defs>
        <Rect fill="url(#compat-bg)" height="236" rx="34" width="280" x="20" y="22" />
        <Circle cx="80" cy="58" fill={accent} fillOpacity="0.15" r="24" />
        <Circle cx="260" cy="234" fill={primary} fillOpacity="0.12" r="18" />

        <G transform="rotate(-9 97 118)">
          <Rect fill="#131A2B" height="92" rx="20" width="96" x="50" y="74" />
          <Rect fill={secondary} fillOpacity="0.85" height="8" rx="4" width="30" x="67" y="93" />
          <Path
            d="M68 146L90 122L108 136L124 110L142 146Z"
            fill={accent}
            fillOpacity="0.65"
          />
        </G>

        <G transform="rotate(7 112 152)">
          <Rect fill="#1B2237" height="92" rx="20" width="96" x="70" y="102" />
          <Rect fill={primary} fillOpacity="0.88" height="8" rx="4" width="36" x="86" y="120" />
          <Path
            d="M86 172L106 146L122 160L136 136L152 172Z"
            fill={secondary}
            fillOpacity="0.72"
          />
        </G>

        <Path
          d="M162 114C180 114 180 86 198 86"
          fill="none"
          stroke={primary}
          strokeLinecap="round"
          strokeWidth="6"
        />
        <Path
          d="M162 152C182 152 182 126 202 126"
          fill="none"
          stroke={secondary}
          strokeLinecap="round"
          strokeWidth="6"
        />
        <Path
          d="M162 190C184 190 184 168 206 168"
          fill="none"
          stroke={accent}
          strokeLinecap="round"
          strokeWidth="6"
        />

        {[
          { label: 'HEIC', y: 76, color: accent },
          { label: 'JPG', y: 116, color: primary },
          { label: 'WEBP', y: 156, color: secondary },
          { label: 'PDF', y: 196, color: '#FF7A59' },
        ].map(item => (
          <G key={item.label}>
            <Rect fill="#0E1322" height="28" rx="14" width="88" x="202" y={item.y} />
            <Circle cx="220" cy={item.y + 14} fill={item.color} r="6" />
            <SvgText
              fill="#F7F9FF"
              fontFamily={BODY_FONT}
              fontSize="12"
              fontWeight="700"
              x="236"
              y={item.y + 18}
            >
              {item.label}
            </SvgText>
          </G>
        ))}
      </Svg>
    );
  }

  if (id === 'control') {
    return (
      <Svg height="100%" viewBox="0 0 320 280" width="100%">
        <Defs>
          <SvgLinearGradient id="control-card" x1="0%" x2="100%" y1="0%" y2="100%">
            <Stop offset="0%" stopColor={secondary} stopOpacity="0.17" />
            <Stop offset="100%" stopColor={primary} stopOpacity="0.08" />
          </SvgLinearGradient>
        </Defs>
        <Rect fill="url(#control-card)" height="236" rx="34" width="280" x="20" y="22" />
        <Rect fill="#121929" height="156" rx="28" width="206" x="58" y="48" />
        <Rect fill="#1B2235" height="68" rx="18" width="170" x="76" y="64" />
        <Path
          d="M92 118L120 88L138 104L164 76L198 118Z"
          fill={primary}
          fillOpacity="0.7"
        />
        <Circle cx="108" cy="82" fill={accent} fillOpacity="0.8" r="10" />

        <Rect fill="#232B42" height="8" rx="4" width="138" x="92" y="150" />
        <Rect fill={primary} height="8" rx="4" width="92" x="92" y="150" />
        <Circle cx="184" cy="154" fill="#F7F9FF" r="11" />

        <Rect fill="#1A2031" height="44" rx="16" width="82" x="58" y="184" />
        <Rect fill="#1A2031" height="44" rx="16" width="82" x="180" y="184" />
        <SvgText
          fill="#8E98B8"
          fontFamily={BODY_FONT}
          fontSize="10"
          fontWeight="600"
          textAnchor="middle"
          x="99"
          y="200"
        >
          {strings.common.original}
        </SvgText>
        <SvgText
          fill="#F7F9FF"
          fontFamily={DISPLAY_FONT}
          fontSize="18"
          x="78"
          y="220"
        >
          14.8 MB
        </SvgText>
        <SvgText
          fill="#8E98B8"
          fontFamily={BODY_FONT}
          fontSize="10"
          fontWeight="600"
          textAnchor="middle"
          x="221"
          y="200"
        >
          {strings.common.converted}
        </SvgText>
        <SvgText
          fill="#F7F9FF"
          fontFamily={DISPLAY_FONT}
          fontSize="18"
          x="198"
          y="220"
        >
          2.6 MB
        </SvgText>
        <Ellipse cx="250" cy="60" fill={accent} fillOpacity="0.16" rx="26" ry="20" />
      </Svg>
    );
  }

  return (
    <Svg height="100%" viewBox="0 0 320 280" width="100%">
      <Defs>
        <SvgLinearGradient id="flow-panel" x1="0%" x2="100%" y1="0%" y2="100%">
          <Stop offset="0%" stopColor={accent} stopOpacity="0.16" />
          <Stop offset="100%" stopColor={primary} stopOpacity="0.08" />
        </SvgLinearGradient>
      </Defs>
      <Rect fill="url(#flow-panel)" height="236" rx="34" width="280" x="20" y="22" />

      {[
        { x: 48, y: 58 },
        { x: 96, y: 82 },
        { x: 68, y: 126 },
      ].map((card, index) => (
        <G key={`${card.x}-${card.y}`} transform={`rotate(${index === 1 ? 5 : -6} ${card.x + 32} ${card.y + 44})`}>
          <Rect fill="#141B2B" height="72" rx="18" width="64" x={card.x} y={card.y} />
          <Circle cx={card.x + 18} cy={card.y + 18} fill={index === 0 ? primary : index === 1 ? accent : secondary} r="7" />
          <Rect fill="#2A3147" height="8" rx="4" width="30" x={card.x + 14} y={card.y + 34} />
          <Rect fill="#232A3D" height="8" rx="4" width="22" x={card.x + 14} y={card.y + 48} />
        </G>
      ))}

      <Path
        d="M142 126C170 126 170 94 198 94"
        fill="none"
        stroke={primary}
        strokeLinecap="round"
        strokeWidth="6"
      />
      <Path
        d="M142 150C174 150 174 176 206 176"
        fill="none"
        stroke={accent}
        strokeLinecap="round"
        strokeWidth="6"
      />

      <Rect fill="#12192A" height="120" rx="24" width="92" x="202" y="78" />
      <Rect fill="#1D2639" height="26" rx="13" width="64" x="216" y="94" />
      <SvgText
        fill="#F7F9FF"
        fontFamily={BODY_FONT}
        fontSize="10"
        fontWeight="700"
        textAnchor="middle"
        x="248"
        y="111"
      >
        {strings.onboarding.preset}
      </SvgText>
      <Rect fill="#1D2639" height="26" rx="13" width="64" x="216" y="128" />
      <SvgText
        fill="#F7F9FF"
        fontFamily={BODY_FONT}
        fontSize="10"
        fontWeight="700"
        textAnchor="middle"
        x="248"
        y="145"
      >
        {strings.complete.share}
      </SvgText>
      <Rect fill="#1D2639" height="26" rx="13" width="64" x="216" y="162" />
      <SvgText
        fill="#F7F9FF"
        fontFamily={BODY_FONT}
        fontSize="10"
        fontWeight="700"
        textAnchor="middle"
        x="248"
        y="179"
      >
        {strings.history.title}
      </SvgText>

      <Circle cx="248" cy="56" fill={primary} fillOpacity="0.16" r="18" />
      <Circle cx="278" cy="216" fill={accent} fillOpacity="0.14" r="14" />
      <SvgText
        fill={textColor}
        fontFamily={DISPLAY_FONT}
        fontSize="22"
        opacity="0.16"
        x="38"
        y="246"
      >
        {strings.common.done}
      </SvgText>
    </Svg>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  brandPill: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  brandText: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  skipButton: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  skipText: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: '600',
  },
  trackViewport: {
    flex: 1,
    overflow: 'hidden',
    paddingTop: 8,
  },
  track: {
    flex: 1,
    flexDirection: 'row',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  heroCard: {
    alignItems: 'center',
    borderRadius: 34,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  copyBlock: {
    flexShrink: 1,
  },
  eyebrow: {
    fontFamily: BODY_FONT,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 40,
    marginTop: 12,
  },
  titleCompact: {
    fontFamily: DISPLAY_FONT,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1.1,
    lineHeight: 35,
    marginTop: 10,
  },
  description: {
    fontFamily: BODY_FONT,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 14,
  },
  descriptionCompact: {
    fontFamily: BODY_FONT,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  chipRowCompact: {
    gap: 8,
    marginTop: 16,
  },
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontFamily: BODY_FONT,
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    borderRadius: 999,
    height: 10,
    width: 34,
  },
  orb: {
    borderRadius: 999,
    position: 'absolute',
  },
  orbTop: {
    height: 220,
    right: -48,
    top: 88,
    width: 220,
  },
  orbBottom: {
    bottom: 154,
    height: 170,
    left: -44,
    width: 170,
  },
});
