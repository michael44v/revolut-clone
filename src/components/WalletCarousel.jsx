import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export default function WalletCarousel({
  wallets,
  selectedWalletId,
  onSelectWallet,
  onAddCurrency,
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Accounts & Wallets</Text>
        <TouchableOpacity onPress={onAddCurrency} style={styles.addBtn}>
          <Plus size={16} color={colors.primary} />
          <Text style={[styles.addBtnText, { color: colors.primary }]}>New Currency</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {wallets.map((w) => {
          const isSelected = w.id === selectedWalletId;
          return (
            <TouchableOpacity
              key={w.id}
              style={[
                styles.walletCard,
                {
                  backgroundColor: colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => onSelectWallet(w)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <Text style={styles.flag}>{w.flag}</Text>
                <View
                  style={[
                    styles.codeBadge,
                    { backgroundColor: isSelected ? colors.primaryLight : colors.chip },
                  ]}
                >
                  <Text
                    style={[
                      styles.codeBadgeText,
                      { color: isSelected ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {w.currency}
                  </Text>
                </View>
              </View>

              <Text style={[styles.cardName, { color: colors.textSecondary }]}>{w.name}</Text>
              <Text style={[styles.cardBalance, { color: colors.text }]}>
                {w.symbol}
                {w.balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  walletCard: {
    width: 145,
    padding: 14,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flag: {
    fontSize: 22,
  },
  codeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  codeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardBalance: {
    fontSize: 16,
    fontWeight: '700',
  },
});
