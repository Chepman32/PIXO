import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../app/providers/ThemeProvider';
import { RootStackParamList } from '../../app/navigation/types';

const SCREEN = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const LOGO_COORDS = [
  [0, 0], [1, 0], [2, 0], [3, 0],
  [0, 1], [3, 1],
  [0, 2], [2, 2], [3, 2],
  [0, 3], [3, 3],
  [0, 4], [1, 4], [2, 4],
  [0, 5],
  [0, 6],
].map(([x, y], index) => ({ x, y, id: index }));

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const textOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 7,
      }),
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timeout = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 1850);

    return () => {
      clearTimeout(timeout);
    };
  }, [logoScale, navigation, textOpacity]);

  const originX = useMemo(() => SCREEN.width / 2 - 16, []);

  return (
    <LinearGradient
      colors={[theme.colors.primaryDark, theme.colors.primary, theme.colors.accent]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.container}
    >
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}> 
        {LOGO_COORDS.map(point => (
          <Animated.View
            key={point.id}
            style={[
              styles.pixel,
              {
                left: originX + point.x * 12,
                top: SCREEN.height * 0.33 + point.y * 12,
              },
            ]}
          />
        ))}
      </Animated.View>
      <Animated.View
        style={[
          styles.textWrap,
          {
            opacity: textOpacity,
            transform: [
              {
                translateY: textOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.wordmark}>PIXO</Text>
        <Text style={styles.tagline}>Image Converter</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoWrap: {
    height: 150,
    width: '100%',
  },
  pixel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    height: 10,
    position: 'absolute',
    width: 10,
  },
  textWrap: {
    alignItems: 'center',
    marginTop: 20,
  },
  wordmark: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: 2,
  },
  tagline: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    marginTop: 4,
  },
});
