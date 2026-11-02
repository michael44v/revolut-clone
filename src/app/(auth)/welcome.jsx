import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Sparkles, ArrowRight, Zap } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { loginAsDemo, isLoading } = useAuth();

  const handleDemoLogin = async () => {
    const res = await loginAsDemo();
    if (res.success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
          <Sparkles size={14} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>Simulation Fintech</Text>
        </View>
      </View>

      <View style={styles.heroSection}>
        <LinearGradient
          colors={['#635BFF', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoCircle}
        >
          <Zap size={38} color="#FFFFFF" />
        </LinearGradient>
        <Text style={[styles.appName, { color: colors.text }]}>Nexus Bank</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Next-generation simulated global banking, multi-currency accounts, and seamless transfers.
        </Text>
      </View>

      <View style={styles.features}>
        <View style={styles.featureItem}>
          <View style={[styles.featureIconBox, { backgroundColor: colors.cardSecondary }]}>
            <Shield size={18} color={colors.primary} />
          </View>
          <View style={styles.featureTextCol}>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Safe Simulation Mode</Text>
            <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
              Explore virtual debit cards, foreign exchange & savings pockets with fictional funds.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.demoButton, { backgroundColor: colors.primary }]}
          onPress={handleDemoLogin}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          <Sparkles size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.demoButtonText}>Continue with Demo Account</Text>
        </TouchableOpacity>

        <View style={styles.subActionsRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Log in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Sign up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.onboardingLink}
          onPress={() => router.push('/(auth)/onboarding')}
        >
          <Text style={[styles.onboardingLinkText, { color: colors.textSecondary }]}>
            Take a 3-step feature tour
          </Text>
          <ArrowRight size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#635BFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  features: {
    paddingVertical: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    gap: 12,
    paddingTop: 10,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 16,
    shadowColor: '#635BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  subActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  onboardingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  onboardingLinkText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
