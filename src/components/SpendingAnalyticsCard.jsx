import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SpendingAnalyticsCard({ analytics }) {
  const { colors } = useTheme();

  if (!analytics) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Spending</Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.topRow}>
          <View>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Total Spent this Month</Text>
            <Text style={[styles.amount, { color: colors.text }]}>
              {analytics.symbol}
              {analytics.totalSpent.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={[styles.limitBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.limitText, { color: colors.primary }]}>Budget on track</Text>
          </View>
        </View>

        {/* Progress bar split by categories */}
        <View style={styles.progressBarWrapper}>
          {analytics.categories.map((cat, i) => (
            <View
              key={cat.name}
              style={[
                styles.progressSegment,
                {
                  flex: cat.percentage,
                  backgroundColor: cat.color,
                  borderTopLeftRadius: i === 0 ? 6 : 0,
                  borderBottomLeftRadius: i === 0 ? 6 : 0,
                  borderTopRightRadius: i === analytics.categories.length - 1 ? 6 : 0,
                  borderBottomRightRadius: i === analytics.categories.length - 1 ? 6 : 0,
                },
              ]}
            />
          ))}
        </View>

        {/* Category list */}
        <View style={styles.categoryList}>
          {analytics.categories.slice(0, 3).map((cat) => (
            <View key={cat.name} style={styles.categoryRow}>
              <View style={styles.categoryNameCol}>
                <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                <Text style={[styles.categoryName, { color: colors.text }]}>{cat.name}</Text>
              </View>
              <Text style={[styles.categoryAmount, { color: colors.textSecondary }]}>
                {analytics.symbol}
                {cat.amount} ({cat.percentage}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  limitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  limitText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarWrapper: {
    height: 10,
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
    gap: 2,
  },
  progressSegment: {
    height: '100%',
  },
  categoryList: {
    gap: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryNameCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: '500',
  },
});
