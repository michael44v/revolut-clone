import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Smartphone,
  Coffee,
  ArrowDownLeft,
  ArrowUpRight,
  Music,
  Repeat,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const ICON_MAP = {
  Smartphone,
  Coffee,
  ArrowDownLeft,
  ArrowUpRight,
  Music,
  Repeat,
};

export default function RecentTransactions({ transactions, onSelectTransaction, onSeeAll }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
        <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
          <ChevronRight size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {transactions.map((tx, idx) => {
          const IconComponent = ICON_MAP[tx.iconName] || ArrowUpRight;
          const isIncome = tx.amount > 0;
          const isLast = idx === transactions.length - 1;

          return (
            <TouchableOpacity
              key={tx.id}
              style={[
                styles.itemRow,
                !isLast && { borderBottomColor: colors.borderSubtle, borderBottomWidth: 1 },
              ]}
              onPress={() => onSelectTransaction(tx)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: isIncome ? colors.successLight : colors.cardSecondary,
                  },
                ]}
              >
                <IconComponent
                  size={18}
                  color={isIncome ? colors.success : colors.icon}
                  strokeWidth={2}
                />
              </View>

              <View style={styles.txInfo}>
                <Text style={[styles.txTitle, { color: colors.text }]} numberOfLines={1}>
                  {tx.title}
                </Text>
                <Text style={[styles.txDate, { color: colors.textSecondary }]}>
                  {tx.date} • {tx.category}
                </Text>
              </View>

              <View style={styles.txAmountCol}>
                <Text
                  style={[
                    styles.txAmount,
                    {
                      color: isIncome ? colors.success : colors.text,
                    },
                  ]}
                >
                  {isIncome ? '+' : ''}
                  {tx.symbol}
                  {Math.abs(tx.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
                <Text style={[styles.txStatus, { color: colors.textMuted }]}>
                  {tx.status}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
    gap: 2,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  txDate: {
    fontSize: 12,
  },
  txAmountCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  txStatus: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
});
