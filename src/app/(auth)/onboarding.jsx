import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, CreditCard, PiggyBank, ArrowRight, Check } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Multi-Currency Freedom',
    description: 'Hold USD, GBP, EUR & NGN wallets. Exchange simulated currencies instantly at transparent market rates.',
    icon: Globe,
    color: '#635BFF',
  },
  {
    id: 2,
    title: 'Instant Virtual Cards',
    description: 'Create multi-use or single-use disposable cards. Freeze, adjust limits, and control online spending seamlessly.',
    icon: CreditCard,
    color: '#0EA5E9',
  },
  {
    id: 3,
    title: 'Smart Savings Pockets',
    description: 'Stash away funds for personal goals with automated round-ups and simulated interest accumulation.',
    icon: PiggyBank,
    color: '#16A36A',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(auth)/welcome');
    }
  };

  const slide = SLIDES[currentIndex];
  const Icon = slide.icon;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.replace('/(auth)/welcome')}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: slide.color + '1A' }]}>
          <Icon size={48} color={slide.color} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{slide.description}</Text>

        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? colors.primary : colors.border,
                  width: i === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          {currentIndex === SLIDES.length - 1 ? (
            <Check size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
          ) : (
            <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
          )}
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
    paddingBottom: 24,
  },
  topNav: {
    alignItems: 'flex-end',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.4,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingTop: 20,
  },
  nextButton: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#635BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
