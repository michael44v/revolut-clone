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
import { walletService } from '../../services/walletService';
import { transactionService } from '../../services/transactionService';
import { analyticsService, notificationService } from '../../services/dashboardService';
import { financialStore } from '../../services/financialStore';

import HomeHeader from '../../components/HomeHeader';
import BalanceCard from '../../components/BalanceCard';
import QuickActions from '../../components/QuickActions';
import WalletCarousel from '../../components/WalletCarousel';
import RecentTransactions from '../../components/RecentTransactions';
import SpendingAnalyticsCard from '../../components/SpendingAnalyticsCard';
import ActionModal from '../../components/ActionModal';
import NotificationModal from '../../components/NotificationModal';
import { DashboardSkeleton } from '../../components/SkeletonLoader';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [totalUsd, setTotalUsd] = useState(0);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeModalAction, setActiveModalAction] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent && wallets.length === 0) {
      setIsLoading(true);
    }
    try {
      // Live fetch directly from backend MySQL database
      const [walletRes, txRes, analyticsRes, notifRes] = await Promise.all([
        walletService.getWallets(),
        transactionService.getTransactions(6),
        analyticsService.getMonthlySummary(),
        notificationService.getNotifications(),
      ]);

if (walletRes.success) {
  const walletList = Array.isArray(walletRes.data?.wallets)
    ? walletRes.data.wallets
    : [];

  setWallets(walletList);
  setTotalUsd(Number(walletRes.data?.totalUsdEquivalent) || 0);

  setSelectedWallet((prev) => {
    if (!prev) return walletList[0] || null;

    return (
      walletList.find((w) => w.id === prev.id) ||
      walletList[0] ||
      null
    );
  });
}

if (txRes.success) {
  setTransactions(
    Array.isArray(txRes.data?.transactions)
      ? txRes.data.transactions
      : []
  );
}

      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      }

      if (notifRes.success) {
        setNotifications(notifRes.data.notifications);
        setUnreadCount(notifRes.data.unreadCount);
      }
    } catch (e) {
      console.warn('Error loading dashboard data from backend:', e);
    } finally {
      setIsLoading(false);
    }
  }, [wallets.length]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (isMounted) {
        await loadData();
      }
    })();

    // Real-time notification and data polling interval (every 8s)
    const interval = setInterval(() => {
      if (isMounted) {
        loadData(true);
      }
    }, 8000);

    const unsubscribe = financialStore.subscribe(() => {
      if (isMounted) {
        loadData(true);
      }
    });

    return () => {
      isMounted = false;
      clearInterval(interval);
      unsubscribe();
    };
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(false);
    setRefreshing(false);
  };

  const handleActionPress = (actionId) => {
    setActiveModalAction(actionId);
  };

  const handleAddMoney = async (currency, amount) => {
    await walletService.addFunds(currency, amount);
    await loadData(true);
  };

  const handleTransfer = async ({ recipientName, amount, currency, reference }) => {
    const res = await transactionService.createSimulatedTransfer({
      recipientName,
      amount,
      currency,
      reference,
    });
    await loadData(true);
    return res;
  };

  const handleRequest = async ({ fromName, amount, currency, note }) => {
    const res = await transactionService.createSimulatedRequest({
      fromName,
      amount,
      currency,
      note,
    });
    await loadData(true);
    return res;
  };

  const handleExchange = async ({ fromCurrency, toCurrency, amount }) => {
    const res = await walletService.convertCurrency(fromCurrency, toCurrency, amount);
    await loadData(true);
    return res;
  };

  const handleMarkAllNotificationsRead = async () => {
    const res = await notificationService.markAllAsRead();
    if (res.success) {
      setNotifications(res.data.notifications);
      setUnreadCount(0);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HomeHeader
        onProfilePress={() => router.push('/(tabs)/profile')}
        onNotificationPress={() => setNotificationModalVisible(true)}
        unreadNotificationsCount={unreadCount}
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
        {isLoading && !refreshing ? (
          <DashboardSkeleton />
        ) : (
          <>
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
                  'Multi-currency accounts support USD, GBP, EUR and NGN with immediate double-entry verification.',
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
          </>
        )}
      </ScrollView>

      {/* Quick Action Modal (Add, Send, Request, Exchange) */}
      <ActionModal
        visible={!!activeModalAction}
        actionType={activeModalAction}
        wallets={wallets}
        onClose={() => setActiveModalAction(null)}
        onAddMoney={handleAddMoney}
        onSubmitTransfer={handleTransfer}
        onSubmitRequest={handleRequest}
        onSubmitExchange={handleExchange}
      />

      {/* Notifications Bottom Sheet Modal */}
      <NotificationModal
        visible={notificationModalVisible}
        notifications={notifications}
        unreadCount={unreadCount}
        onClose={() => setNotificationModalVisible(false)}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
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
                  <Text
                    style={[
                      styles.infoVal,
                      { color: selectedTx.status === 'completed' ? colors.success : colors.warning },
                    ]}
                  >
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
                {selectedTx.fee !== undefined ? (
                  <View style={styles.detailRow}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Transaction Fee</Text>
                    <Text style={[styles.infoVal, { color: colors.text }]}>$0.00 (Free)</Text>
                  </View>
                ) : null}
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
