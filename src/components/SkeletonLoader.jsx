import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function SkeletonItem({ width = '100%', height = 20, borderRadius = 8, style }) {
  const { isDark } = useTheme();
  const [opacityAnim] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.75,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacityAnim]);

  const baseColor = isDark ? '#262936' : '#E2E5EB';

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

export function DashboardSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Balance Card Skeleton */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.rowBetween}>
          <SkeletonItem width={100} height={14} />
          <SkeletonItem width={50} height={24} borderRadius={12} />
        </View>
        <SkeletonItem width={180} height={42} style={{ marginVertical: 12 }} />
        <SkeletonItem width={140} height={20} borderRadius={6} />
      </View>

      {/* Quick Actions Skeleton */}
      <View style={styles.quickRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.actionCol}>
            <SkeletonItem width={50} height={50} borderRadius={25} />
            <SkeletonItem width={40} height={10} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>

      {/* Wallets Carousel Skeleton */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <SkeletonItem width={140} height={16} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <SkeletonItem width={135} height={105} borderRadius={18} />
          <SkeletonItem width={135} height={105} borderRadius={18} />
          <SkeletonItem width={135} height={105} borderRadius={18} />
        </View>
      </View>

      {/* Recent Transactions Skeleton */}
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        <SkeletonItem width={160} height={16} style={{ marginBottom: 4 }} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 16, gap: 14 }]}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.txRow}>
              <SkeletonItem width={40} height={40} borderRadius={20} />
              <View style={{ flex: 1, gap: 6 }}>
                <SkeletonItem width="60%" height={14} />
                <SkeletonItem width="35%" height={10} />
              </View>
              <SkeletonItem width={60} height={16} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionCol: {
    alignItems: 'center',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
