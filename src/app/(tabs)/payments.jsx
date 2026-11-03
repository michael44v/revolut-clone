import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Send, ArrowDownLeft, Repeat } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { transactionService } from '../../services/transactionService';
import { financialStore } from '../../services/financialStore';

const RECIPIENTS = [
  { id: '1', name: 'Sarah J.', revtag: '@sarahj', avatar: 'SJ' },
  { id: '2', name: 'Marcus Sterling', revtag: '@msterl', avatar: 'MS' },
  { id: '3', name: 'TechCorp', revtag: '@techcorp', avatar: 'TC' },
  { id: '4', name: 'Elena Rostova', revtag: '@elenar', avatar: 'ER' },
];

const FILTERS = ['All', 'Income', 'Transfers', 'Shopping', 'Exchange'];

export default function PaymentsScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const res = await transactionService.getTransactions(30);
      if (res.success && isMounted) {
        setTransactions(res.data.transactions);
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

  const filteredTransactions = transactions.filter((item) => {
    // Search query
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.reference && item.reference.toLowerCase().includes(search.toLowerCase())) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase()));

    // Category filter
    let matchesCategory = true;
    if (activeFilter === 'Income') {
      matchesCategory = item.amount > 0;
    } else if (activeFilter === 'Transfers') {
      matchesCategory = item.category === 'Transfer' || item.category === 'Deposit';
    } else if (activeFilter === 'Shopping') {
      matchesCategory = item.category === 'Shopping' || item.category === 'Food';
    } else if (activeFilter === 'Exchange') {
      matchesCategory = item.category === 'Exchange';
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transfers & Payments</Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search name, revtag, or reference"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              {
                backgroundColor: activeFilter === f ? colors.primary : colors.chip,
              },
            ]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === f ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.recipientsSection}>
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Recent Contacts</Text>
        <View style={styles.contactsRow}>
          {RECIPIENTS.map((rec) => (
            <TouchableOpacity
              key={rec.id}
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => setSearch(rec.name)}
            >
              <View style={[styles.contactAvatar, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>{rec.avatar}</Text>
              </View>
              <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>
                {rec.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            Ledger History ({filteredTransactions.length})
          </Text>
        </View>

        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No transfers found matching your filter.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.txCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => setSelectedTx(item)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.txIconBox,
                  {
                    backgroundColor:
                      item.category === 'Exchange'
                        ? colors.primaryLight
                        : item.amount > 0
                        ? colors.successLight
                        : colors.cardSecondary,
                  },
                ]}
              >
                {item.category === 'Exchange' ? (
                  <Repeat size={18} color={colors.primary} />
                ) : item.amount > 0 ? (
                  <ArrowDownLeft size={18} color={colors.success} />
                ) : (
                  <Send size={18} color={colors.primary} />
                )}
              </View>
              <View style={styles.txDetails}>
                <Text style={[styles.txTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.txRef, { color: colors.textSecondary }]}>
                  {item.date} • {item.reference || item.subtitle}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Text
                  style={[
                    styles.txAmount,
                    { color: item.amount > 0 ? colors.success : colors.text },
                  ]}
                >
                  {item.amount > 0 ? '+' : ''}
                  {item.symbol}
                  {Math.abs(item.amount).toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.txStatus,
                    { color: item.status === 'completed' ? colors.textMuted : colors.warning },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

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
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Settlement</Text>
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recipientsSection: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  contactsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactItem: {
    alignItems: 'center',
    width: 70,
    gap: 6,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  contactName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  historySection: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDetails: {
    flex: 1,
    gap: 2,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  txRef: {
    fontSize: 11,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  txStatus: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  detailCategory: {
    fontSize: 13,
    marginBottom: 16,
  },
  detailAmount: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 20,
  },
  detailInfoBox: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    gap: 10,
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
