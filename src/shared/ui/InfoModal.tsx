import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Button } from './Button';

interface InfoModalProps {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ visible, title, body, onClose }) => {
  const theme = useTheme();

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl }]}>
          <Text style={[theme.typography.titleMedium, { color: theme.colors.textPrimary, textAlign: 'center' }]}>
            {title}
          </Text>
          <Text style={[theme.typography.bodyMedium, styles.body, { color: theme.colors.textSecondary }]}>
            {body}
          </Text>
          <Button label="OK" onPress={onClose} fullWidth />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    padding: 24,
    gap: 12,
  },
  body: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
