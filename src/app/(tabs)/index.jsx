import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  View,
  Alert,
  Modal,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { walletService } from '../../services/walletService';
import { transactionService } from '../../services/transactionService';
import { analyticsService, savingsService } from '../../services/dashboardService';

import HomeHeader from '../../components/HomeHeader';
import BalanceCard from '../../components/BalanceCard';
import QuickActions from '../../components/QuickActions';
import WalletCarousel from '../../components/WalletCarousel';
import RecentTransactions from '../../components/RecentTransactions';
import SpendingAnalyticsCard from '../../components/SpendingAnalyticsCard';
import ActionModal from '../../components/ActionModal';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [totalUsd, setTotalUsd] = useState(11485.5);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeModalAction, setActiveModalAction] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [walletRes, txRes, analyticsRes] = await Promise.all([
        walletService.getWallets(),
        transactionService.getTransactions(5),
        analyticsService.getMonthlySummary(),
      ]);

      if (walletRes.success) {
        setWallets(walletRes.data.wallets);
        setTotalUsd(walletRes.data.totalUsdEquivalent);
        if (!selectedWallet && walletRes.data.wallets.length > 0) {
          setSelectedWallet(walletRes.data.wallets[0]);
        }
      }

      if (txRes.success) {
        setTransactions(txRes.data.transactions);
      }

      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      }
    } catch (e) {
      console.warn('Error loading dashboard data:', e);
    }
  }, [selectedWallet]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleActionPress = (actionId) => {
    setActiveModalAction(actionId);
  };

  const handleAddMoney = async (currency, amount) => {
    await walletService.addFunds(currency, amount);
    await loadData();
  };

  const handleTransfer = async ({ recipientName, amount, currency, reference }) => {
    await transactionService.createSimulatedTransfer({
      recipientName,
      amount,
      currency,
      reference,
    });
    // Deduct simulated balance
    await walletService.addFunds(currency, -amount);
    await loadData();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HomeHeader
        onProfilePress={() => router.push('/(tabs)/profile')}
        onNotificationPress={() => {
          Alert.alert('Notifications', 'You have no unread security or payment alerts.');
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <BalanceCard
          totalUsd={totalUsd}
          isBalanceVisible={isBalanceVisible}
          onToggleVisibility={() => setIsBalanceVisible(!isBalanceVisible)}
          activeCurrency={selectedWallet?.currency || 'USD'}
          onCurrencySelectPress={() => {
            setActiveModalAction('exchange');
          }}
        />

        <QuickActions onActionPress={handleActionPress} />

        <WalletCarousel
          wallets={wallets}
          selectedWalletId={selectedWallet?.id}
          onSelectWallet={(w) => setSelectedWallet(w)}
          onAddCurrency={() => {
            Alert.alert(
              'Add Currency Wallet',
              'Multi-currency support allows holding JPY, CAD, CHF, AUD and more in the simulation.',
              [{ text: 'Got it' }]
            );
          }}
        />

        <SpendingAnalyticsCard analytics={analytics} />

        <RecentTransactions
          transactions={transactions}
          onSelectTransaction={(tx) => setSelectedTx(tx)}
          onSeeAll={() => router.push('/(tabs)/payments')}
        />
      </ScrollView>

      {/* Quick Action Modal (Add, Send, Request, Exchange) */}
      <ActionModal
        visible={!!activeModalAction}
        actionType={activeModalAction}
        wallets={wallets}
        onClose={() => setActiveModalAction(null)}
        onAddMoney={handleAddMoney}
        onSubmitTransfer={handleTransfer}
      />

      {/* Transaction Details Modal */}
      {selectedTx && (
        <Modal visible={!!selectedTx} transparent animationType="fade">
          <View style={[styles.detailOverlay, { backgroundColor: colors.modalOverlay }]}>
            <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedTx.title}</Text>
              <Text style={[styles.detailCategory, { color: colors.textSecondary }]}>
                {selectedTx.category} • {selectedTx.date}
              </Text>
              <Text
                style={[
                  styles.detailAmount,
                  { color: selectedTx.amount > 0 ? colors.success : colors.text },
                ]}
              >
                {selectedTx.amount > 0 ? '+' : ''}
                {selectedTx.symbol}
                {Math.abs(selectedTx.amount).toFixed(2)}
              </Text>

              <View style={[styles.detailInfoBox, { backgroundColor: colors.cardSecondary }]}>
                <View style={styles.detailRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Status</Text>
                  <Text style={[styles.infoVal, { color: colors.success }]}>
                    {selectedTx.status.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Reference</Text>
                  <Text style={[styles.infoVal, { color: colors.text }]}>{selectedTx.reference}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Ledger Unit</Text>
                  <Text style={[styles.infoVal, { color: colors.text }]}>Double-entry verified</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.closeDetailBtn, { backgroundColor: colors.primary }]}
                onPress={() => setSelectedTx(null)}
              >
                <Text style={styles.closeDetailText}>Close Receipt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  detailOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  detailCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  detailCategory: {
    fontSize: 13,
    marginBottom: 16,
  },
  detailAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 20,
  },
  detailInfoBox: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeDetailBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeDetailText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
