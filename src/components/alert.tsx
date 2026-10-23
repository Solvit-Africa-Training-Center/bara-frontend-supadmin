import Feather from '@expo/vector-icons/Feather';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/theme';

export type AlertTone = 'primary' | 'success' | 'warning' | 'danger';

export type AlertConfig = {
  title: string;
  message?: string;
  tone?: AlertTone;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type AlertHandler = (config: AlertConfig) => void;
let globalAlertHandler: AlertHandler | null = null;

function detectTone(title: string, message?: string, isConfirm?: boolean): AlertTone {
  const combined = `${title} ${message ?? ''}`.toLowerCase();
  if (combined.includes('reject') || combined.includes('sign out') || combined.includes('restrict') || combined.includes('lock') || combined.includes('error') || combined.includes('failed')) {
    return isConfirm ? 'danger' : 'warning';
  }
  if (combined.includes('approved') || combined.includes('applied') || combined.includes('created') || combined.includes('sent') || combined.includes('exported') || combined.includes('resolved') || combined.includes('success')) {
    return 'success';
  }
  if (combined.includes('check') || combined.includes('required') || combined.includes('attention') || combined.includes('warning')) {
    return 'warning';
  }
  return 'primary';
}

/** Show a custom notification dialog replacing window.alert or Alert.alert. */
export function customNotify(title: string, message?: string, tone?: AlertTone) {
  const resolvedTone = tone ?? detectTone(title, message, false);
  if (globalAlertHandler) {
    globalAlertHandler({
      title,
      message,
      tone: resolvedTone,
      isConfirm: false,
      confirmText: 'OK',
    });
  } else {
    // Fallback if provider not mounted
    if (Platform.OS === 'web') window.alert(`${title}${message ? `\n\n${message}` : ''}`);
  }
}

/** Show a custom confirmation dialog replacing window.confirm or Alert.alert with cancel/confirm buttons. */
export function customConfirm(title: string, message: string, onYes: () => void, yesLabel = 'Confirm', tone?: AlertTone) {
  const resolvedTone = tone ?? detectTone(title, message, true);
  if (globalAlertHandler) {
    globalAlertHandler({
      title,
      message,
      tone: resolvedTone,
      isConfirm: true,
      confirmText: yesLabel,
      cancelText: 'Cancel',
      onConfirm: onYes,
    });
  } else {
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) onYes();
    }
  }
}

const toneStyles: Record<AlertTone, { bg: string; iconColor: string; icon: keyof typeof Feather.glyphMap; btnBg?: string }> = {
  primary: { bg: colors.yellowBg, iconColor: colors.primary, icon: 'info' },
  success: { bg: colors.greenBg, iconColor: colors.greenText, icon: 'check-circle' },
  warning: { bg: colors.yellowBg, iconColor: colors.yellowText, icon: 'alert-triangle' },
  danger: { bg: colors.redBg, iconColor: colors.redText, icon: 'alert-circle', btnBg: colors.redText },
};

export function CustomAlertProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<AlertConfig | null>(null);

  const openAlert = useCallback((config: AlertConfig) => {
    setCurrent(config);
  }, []);

  useEffect(() => {
    globalAlertHandler = openAlert;
    return () => {
      if (globalAlertHandler === openAlert) globalAlertHandler = null;
    };
  }, [openAlert]);

  const handleClose = () => {
    const onCancel = current?.onCancel;
    setCurrent(null);
    if (onCancel) onCancel();
  };

  const handleConfirm = () => {
    const onConfirm = current?.onConfirm;
    setCurrent(null);
    if (onConfirm) onConfirm();
  };

  const toneConfig = toneStyles[current?.tone ?? 'primary'];

  return (
    <>
      {children}
      <Modal visible={!!current} transparent animationType="fade" onRequestClose={handleClose}>
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.iconWrap, { backgroundColor: toneConfig.bg }]}>
              <Feather name={toneConfig.icon} size={22} color={toneConfig.iconColor} />
            </View>

            <Text style={styles.title}>{current?.title}</Text>
            {current?.message ? <Text style={styles.message}>{current.message}</Text> : null}

            <View style={styles.actions}>
              {current?.isConfirm ? (
                <Pressable onPress={handleClose} style={[styles.btn, styles.cancelBtn]}>
                  <Text style={styles.cancelText}>{current?.cancelText || 'Cancel'}</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={handleConfirm}
                style={[styles.btn, styles.confirmBtn, toneConfig.btnBg ? { backgroundColor: toneConfig.btnBg } : null]}
              >
                <Text style={styles.confirmText}>{current?.confirmText || 'OK'}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(58, 45, 36, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 18,
    lineHeight: 23,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  btn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  cancelBtn: {
    backgroundColor: colors.cardMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.text,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
  },
  confirmText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: '#fff',
  },
});
