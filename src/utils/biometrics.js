import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

/**
 * Biometrics / Face ID Service
 * Provides hardware detection and biometric authentication (Face ID, Touch ID, Biometric prompt).
 * Returns fallback simulation on web or non-supported devices.
 */

export const biometricsService = {
  async isAvailable() {
    if (Platform.OS === 'web') {
      return {
        available: true,
        type: 'Simulated Face ID',
        hasHardware: true,
        isEnrolled: true,
      };
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let typeName = 'Biometrics';
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        typeName = 'Face ID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        typeName = 'Fingerprint / Touch ID';
      }

      return {
        available: hasHardware && isEnrolled,
        type: typeName,
        hasHardware,
        isEnrolled,
      };
    } catch (_e) {
      return {
        available: false,
        type: 'Biometrics',
        hasHardware: false,
        isEnrolled: false,
      };
    }
  },

  async authenticate(promptMessage = 'Confirm your identity') {
    if (Platform.OS === 'web') {
      // Smooth simulation on web
      await new Promise((r) => setTimeout(r, 400));
      return { success: true };
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use PIN code',
        disableDeviceFallback: false,
      });

      return {
        success: result.success,
        error: result.error,
      };
    } catch (_e) {
      return {
        success: true, // Graceful fallback
      };
    }
  },
};
