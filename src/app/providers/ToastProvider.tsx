import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from './ThemeProvider';

interface ToastInput {
  title: string;
  tone?: 'info' | 'error' | 'success';
}

interface ToastContextValue {
  showToast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => undefined,
});

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toast, setToast] = useState<ToastInput | null>(null);
  const theme = useTheme();

  const showToast = useCallback((input: ToastInput) => {
    setToast(input);
    setTimeout(() => {
      setToast(null);
    }, 2400);
  }, []);

  const background = useMemo(() => {
    switch (toast?.tone) {
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.textPrimary;
    }
  }, [theme, toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <View style={[styles.toast, { backgroundColor: background }]}> 
          <Text style={[theme.typography.bodyMedium, styles.text]}>{toast.title}</Text>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toast: {
    alignSelf: 'center',
    borderRadius: 12,
    bottom: 24,
    maxWidth: '90%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'absolute',
  },
  text: {
    color: '#FFFFFF',
  },
});
