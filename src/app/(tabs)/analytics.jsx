import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Target } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { analyticsService, savingsService } from '../../services/dashboardService';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const [data, setData] = useState(null);
  const [pockets, setPockets] = useState([]);

  useEffect(() => {
    async function load() {
      const [aRes, sRes] = await Promise.all([
        analyticsService.getMonthlySummary(),
        savingsService.getPockets(),
      ]);
      if (aRes.success) setData(aRes.data);
      if (sRes.success) setPockets(sRes.data);
    }
    load();
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
            <Text style={[styles.cfVal, { color: colors.success }]}>+$5,500.00</Text>
          </View>

          <View style={[styles.cashflowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cfTop}>
              <Text style={[styles.cfLabel, { color: colors.textSecondary }]}>Total Outflow</Text>
              <ArrowUpRight size={16} color={colors.danger} />
            </View>
            <Text style={[styles.cfVal, { color: colors.text }]}>-$2,840.50</Text>
          </View>
        </View>

        {/* Weekly chart representation */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Daily Activity (This Week)</Text>
          <View style={styles.barGraph}>
            {data?.weeklyTrends?.map((d) => {
              const heightPercent = Math.min((d.amount / 350) * 100, 100);
              return (
                <View key={d.day} style={styles.barCol}>
                  <View style={styles.barTrack}>
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

        {/* Savings targets */}
        <View style={styles.savingsSection}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Savings Goals & Pockets</Text>
          {pockets.map((p) => {
            const pct = Math.round((p.currentAmount / p.targetAmount) * 100);
            return (
              <View
                key={p.id}
                style={[styles.pocketCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.pocketTop}>
                  <Text style={[styles.pocketName, { color: colors.text }]}>{p.name}</Text>
                  <Text style={[styles.pocketPct, { color: colors.primary }]}>{pct}%</Text>
                </View>
                <View style={styles.pocketBar}>
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
    fontSize: 18,
    fontWeight: '700',
  },
  chartCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 20,
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
    backgroundColor: '#E5E7EB',
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
    backgroundColor: '#E5E7EB',
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
