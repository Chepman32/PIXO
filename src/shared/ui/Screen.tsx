import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../app/providers/ThemeProvider';

interface ScreenProps {
  withKeyboardAvoiding?: boolean;
  children: React.ReactNode;
}

export const Screen: React.FC<ScreenProps> = ({ withKeyboardAvoiding, children }) => {
  const theme = useTheme();

  const content = (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );

  if (!withKeyboardAvoiding) {
    return content;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.safeArea}
    >
      {content}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
