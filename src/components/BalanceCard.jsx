import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, TrendingUp, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export default function BalanceCard({
  totalUsd,
  isBalanceVisible,
  onToggleVisibility,
  activeCurrency,
  onCurrencySelectPress,
}) {
  const { colors, typography } = useTheme();

  const formattedAmount = isBalanceVisible
    ? `$${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '••••••••';

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={styles.labelGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Total Balance</Text>
          <TouchableOpacity
            onPress={onToggleVisibility}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.eyeBtn}
          >
            {isBalanceVisible ? (
              <Eye size={16} color={colors.textSecondary} />
            ) : (
              <EyeOff size={16} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.currencyBadge, { backgroundColor: colors.chip }]}
          onPress={onCurrencySelectPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.currencyBadgeText, { color: colors.text }]}>{activeCurrency}</Text>
          <ChevronRight size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.balanceText, { color: colors.text }]}>{formattedAmount}</Text>

      <View style={styles.subInfoRow}>
        <View style={[styles.gainBadge, { backgroundColor: colors.successLight }]}>
          <TrendingUp size={12} color={colors.success} />
          <Text style={[styles.gainText, { color: colors.success }]}>+$248.50 this month</Text>
        </View>
        <Text style={[styles.simulationNote, { color: colors.textMuted }]}>
          Simulated multi-currency account
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 2,
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  currencyBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  balanceText: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginVertical: 4,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  gainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gainText: {
    fontSize: 12,
    fontWeight: '600',
  },
  simulationNote: {
    fontSize: 11,
    fontWeight: '500',
  },
});
