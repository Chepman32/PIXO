import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { prepareAppFilesystem } from '../../shared/lib/bootstrap';
import { useTheme } from './ThemeProvider';
import { useAppStore } from './store/useAppStore';
import { logger } from '../../shared/lib/logger';

export const AppBootstrap: React.FC<React.PropsWithChildren> = ({ children }) => {
  const initialized = useAppStore(state => state.initialized);
  const setInitialized = useAppStore(state => state.setInitialized);
  const theme = useTheme();

  useEffect(() => {
    let mounted = true;
    prepareAppFilesystem()
      .then(() => {
        if (mounted) {
          setInitialized(true);
        }
      })
      .catch(error => {
        logger.error('prepareAppFilesystem failed', error);
        if (mounted) {
          setInitialized(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [setInitialized]);

  if (!initialized) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.colors.background }]}> 
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
