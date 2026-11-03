import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ArrowRight, Zap, Send } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const HERO_IMAGE = require('../assets/images/image.png');

// Offsets (as % of hero height / px from right edge) so flags float in a scattered layout
const FLAGS = [
  { code: 'US', label: 'USA', emoji: '🇺🇸', top: '24%', right: 22, size: 38 },
  { code: 'GB', label: 'UK', emoji: '🇬🇧', top: '42%', right: 88, size: 44 },
  { code: 'CA', label: 'Canada', emoji: '🇨🇦', top: '60%', right: 18, size: 40 },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();
  const { loginAsDemo, isLoading } = useAuth();

  const heroHeight = Math.round(height * 0.6);

  const handleDemoLogin = async () => {
    const res = await loginAsDemo();
    if (res.success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Full-bleed hero: covers full width and runs under the status bar */}
        <View style={[styles.hero, { width, height: heroHeight }]}>
          <Image
            source={HERO_IMAGE}
            style={{ position: 'absolute', top: 0, left: 0, width, height: heroHeight }}
            resizeMode="cover"
          />

          {/* Dark fade at the top so the header stays readable */}
          <LinearGradient
            colors={['rgba(10, 8, 30, 0.65)', 'transparent']}
            style={[styles.topFade, { height: insets.top + 90 }]}
          />
          {/* Dark fade at the bottom for the chip */}
          <LinearGradient
            colors={['transparent', 'rgba(10, 8, 30, 0.7)']}
            style={styles.bottomFade}
          />

          {/* Header on top of the image */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <View style={styles.brandRow}>
              <LinearGradient
                colors={['#635BFF', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoMark}
              >
                <Zap size={18} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.brandName}>Revolut Bank</Text>
            </View>
            <View style={styles.badge}>
              <Sparkles size={12} color="#FFFFFF" />
              <Text style={styles.badgeText}>Simulation</Text>
            </View>
          </View>

          {/* Flags floating on top of the image, scattered on the right */}
          {FLAGS.map((flag) => (
            <View
              key={flag.code}
              style={[styles.flagItem, { top: flag.top, right: flag.right }]}
            >
              <View
                style={[
                  styles.flagCircle,
                  {
                    width: flag.size + 28,
                    height: flag.size + 28,
                    borderRadius: (flag.size + 28) / 2,
                  },
                ]}
              >
                <Text style={[styles.flagEmoji, { fontSize: flag.size }]}>{flag.emoji}</Text>
              </View>
              <Text style={styles.flagLabel}>{flag.label}</Text>
            </View>
          ))}

          {/* Chip on top of the image, bottom left */}
          <View style={styles.photoChip}>
            <View style={styles.photoChipIcon}>
              <Send size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.photoChipTitle}>Money sent</Text>
              <Text style={styles.photoChipSub}>Arrived in seconds</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.textSection}>
            <Text style={[styles.headline, { color: colors.text }]}>
              Banking without borders
            </Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Multi-currency accounts and seamless transfers across the USA, UK and Canada.
            </Text>
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
                style={[
                  styles.secondaryButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Log in</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => router.push('/(auth)/onboarding')}
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Hero
  hero: {
    overflow: 'hidden',
    backgroundColor: '#1B1840',
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },

  // Header (over image)
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Flags (over image) - no background, scattered positions
  flagItem: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
  },
  // Semi-transparent "glass" background behind each flag
  flagCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  flagEmoji: {
    textAlign: 'center',
  },
  flagLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Chip (over image)
  photoChip: {
    position: 'absolute',
    left: 16,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  photoChipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#635BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoChipTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  photoChipSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    marginTop: 1,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 22,
    justifyContent: 'space-between',
    gap: 20,
  },
  textSection: {
    alignItems: 'center',
    gap: 8,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
  },

  // Actions
  actions: {
    gap: 12,
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