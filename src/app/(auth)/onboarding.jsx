import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, CreditCard, PiggyBank, ArrowRight, Check, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

const SLIDES = [
  {
    id: '1',
    title: 'Multi-Currency Freedom',
    description: 'Hold USD, GBP, EUR & NGN wallets with real-time double-entry ledger verification. Convert currencies instantly at transparent market rates.',
    icon: Globe,
    color: '#635BFF',
    userImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80',
    userName: 'Alex Rivera',
    userRole: 'Verified Global Account Holder',
  },
  {
    id: '2',
    title: 'Instant Virtual Cards',
    description: 'Generate multi-use and single-use disposable cards. Freeze, unfreeze, and adjust security controls with one tap.',
    icon: CreditCard,
    color: '#0EA5E9',
    userImage: null,
  },
  {
    id: '3',
    title: 'Smart Savings Pockets',
    description: 'Organize funds toward your personal financial goals. Track portfolio allocations and analyze spending in real time.',
    icon: PiggyBank,
    color: '#16A36A',
    userImage: null,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(auth)/register');
    }
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <View style={[styles.slide, { width }]}>
              {item.userImage ? (
                <View style={styles.userPhotoContainer}>
                  <Image source={{ uri: item.userImage }} style={styles.userPhoto} />
                  <View style={[styles.floatingBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Sparkles size={14} color={colors.primary} />
                    <View>
                      <Text style={[styles.floatingName, { color: colors.text }]}>{item.userName}</Text>
                      <Text style={[styles.floatingRole, { color: colors.textSecondary }]}>{item.userRole}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={[styles.iconCircle, { backgroundColor: item.color + '1A' }]}>
                  <Icon size={52} color={item.color} />
                </View>
              )}

              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {item.description}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === currentIndex ? 24 : 8,
                  backgroundColor: i === currentIndex ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === SLIDES.length - 1 ? 'Open Account' : 'Continue'}
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
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  topNav: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  userPhotoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  userPhoto: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#635BFF',
  },
  floatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  floatingName: {
    fontSize: 13,
    fontWeight: '700',
  },
  floatingRole: {
    fontSize: 10,
    fontWeight: '500',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    paddingHorizontal: 12,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 24,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
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
