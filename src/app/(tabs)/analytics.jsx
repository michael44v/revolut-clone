import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { analyticsService, savingsService } from '../../services/dashboardService';
import { walletService } from '../../services/walletService';
import { financialStore } from '../../services/financialStore';

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const [data, setData] = useState(null);
  const [pockets, setPockets] = useState([]);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const [aRes, sRes, wRes] = await Promise.all([
        analyticsService.getMonthlySummary(),
        savingsService.getPockets(),
        walletService.getWallets(),
      ]);
      if (isMounted) {
        if (aRes.success) setData(aRes.data);
        if (sRes.success) setPockets(sRes.data);
        if (wRes.success) setWallets(wRes.data.wallets);
      }
    }
    load();

    const unsubscribe = financialStore.subscribe(() => {
      if (isMounted) {
        load();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Analytics & Insights</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cashflow overview */}
        <View style={styles.cashflowRow}>
          <View style={[styles.cashflowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cfTop}>
              <Text style={[styles.cfLabel, { color: colors.textSecondary }]}>Total Inflow</Text>
              <ArrowDownLeft size={16} color={colors.success} />
            </View>
            <Text style={[styles.cfVal, { color: colors.success }]}>
              +${data?.totalIncome?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </Text>
          </View>

          <View style={[styles.cashflowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cfTop}>
              <Text style={[styles.cfLabel, { color: colors.textSecondary }]}>Total Outflow</Text>
              <ArrowUpRight size={16} color={colors.danger} />
            </View>
            <Text style={[styles.cfVal, { color: colors.text }]}>
              -${data?.totalSpent?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </Text>
          </View>
        </View>

        {/* Weekly chart representation */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Daily Activity (This Week)</Text>
            <Text style={[styles.chartBadge, { color: colors.primary }]}>Live Simulated</Text>
          </View>
          <View style={styles.barGraph}>
            {data?.weeklyTrends?.map((d) => {
              const heightPercent = Math.min((d.amount / 350) * 100, 100);
              return (
                <View key={d.day} style={styles.barCol}>
                  <View style={[styles.barTrack, { backgroundColor: colors.cardSecondary }]}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${heightPercent}%`, backgroundColor: colors.primary },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDay, { color: colors.textSecondary }]}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Currency Wallet Breakdown */}
        <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.breakdownHeader}>
            <Wallet size={16} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Portfolio Breakdown</Text>
          </View>

          <View style={styles.walletList}>
            {wallets.map((w) => (
              <View key={w.id} style={styles.walletRow}>
                <View style={styles.walletNameGroup}>
                  <Text style={styles.flagIcon}>{w.flag}</Text>
                  <View>
                    <Text style={[styles.walletTitle, { color: colors.text }]}>{w.name}</Text>
                    <Text style={[styles.walletSub, { color: colors.textSecondary }]}>{w.currency}</Text>
                  </View>
                </View>
                <Text style={[styles.walletBalText, { color: colors.text }]}>
                  {w.symbol}
                  {w.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Savings targets */}
        <View style={styles.savingsSection}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Savings Goals & Pockets</Text>
          {pockets.map((p) => {
            const pct = Math.round((p.currentAmount / p.targetAmount) * 100);
            return (
              <View
                key={p.id}
                style={[styles.pocketCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.pocketTop}>
                  <Text style={[styles.pocketName, { color: colors.text }]}>{p.name}</Text>
                  <Text style={[styles.pocketPct, { color: colors.primary }]}>{pct}%</Text>
                </View>
                <View style={[styles.pocketBar, { backgroundColor: colors.cardSecondary }]}>
                  <View
                    style={[
                      styles.pocketProgress,
                      { width: `${pct}%`, backgroundColor: p.color || colors.primary },
                    ]}
                  />
                </View>
                <View style={styles.pocketBottom}>
                  <Text style={[styles.pocketAmount, { color: colors.textSecondary }]}>
                    ${p.currentAmount.toLocaleString()} saved
                  </Text>
                  <Text style={[styles.pocketTarget, { color: colors.textMuted }]}>
                    Target: ${p.targetAmount.toLocaleString()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  cashflowRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cashflowCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
  },
  cfTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cfLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  cfVal: {
    fontSize: 17,
    fontWeight: '700',
  },
  chartCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  chartBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  barGraph: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 4,
  },
  barCol: {
    alignItems: 'center',
    gap: 8,
    width: 28,
  },
  barTrack: {
    height: 90,
    width: 14,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barDay: {
    fontSize: 11,
    fontWeight: '600',
  },
  breakdownCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletList: {
    gap: 12,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flagIcon: {
    fontSize: 18,
  },
  walletTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  walletSub: {
    fontSize: 11,
  },
  walletBalText: {
    fontSize: 14,
    fontWeight: '700',
  },
  savingsSection: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
  },
  pocketCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  pocketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pocketName: {
    fontSize: 14,
    fontWeight: '600',
  },
  pocketPct: {
    fontSize: 13,
    fontWeight: '700',
  },
  pocketBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  pocketProgress: {
    height: '100%',
    borderRadius: 4,
  },
  pocketBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pocketAmount: {
    fontSize: 12,
    fontWeight: '500',
  },
  pocketTarget: {
    fontSize: 12,
  },
});
