import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Send, ArrowDownLeft, QrCode } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { transactionService } from '../../services/transactionService';

const RECIPIENTS = [
  { id: '1', name: 'Sarah J.', revtag: '@sarahj', avatar: 'SJ' },
  { id: '2', name: 'Marcus Sterling', revtag: '@msterl', avatar: 'MS' },
  { id: '3', name: 'TechCorp', revtag: '@techcorp', avatar: 'TC' },
  { id: '4', name: 'Elena Rostova', revtag: '@elenar', avatar: 'ER' },
];

export default function PaymentsScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await transactionService.getTransactions(15);
      if (res.success) setTransactions(res.data.transactions);
    }
    load();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transfers & Payments</Text>
        <TouchableOpacity
          style={[styles.qrBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <QrCode size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search name, revtag, or phone"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.recipientsSection}>
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Recent Contacts</Text>
        <View style={styles.contactsRow}>
          {RECIPIENTS.map((rec) => (
            <TouchableOpacity key={rec.id} style={styles.contactItem} activeOpacity={0.7}>
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
        <Text style={[styles.sectionHeading, { color: colors.textSecondary, marginBottom: 8 }]}>
          Transfer History
        </Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={[
                styles.txCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.txIconBox,
                  {
                    backgroundColor: item.amount > 0 ? colors.successLight : colors.cardSecondary,
                  },
                ]}
              >
                {item.amount > 0 ? (
                  <ArrowDownLeft size={18} color={colors.success} />
                ) : (
                  <Send size={18} color={colors.primary} />
                )}
              </View>
              <View style={styles.txDetails}>
                <Text style={[styles.txTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.txRef, { color: colors.textSecondary }]}>
                  {item.reference || item.subtitle}
                </Text>
              </View>
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
            </View>
          )}
        />
      </View>
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
  qrBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  recipientsSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
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
    fontSize: 12,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
