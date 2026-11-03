import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Unlock, Plus, ShieldCheck, Eye, EyeOff, Globe, CreditCard } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { cardService } from '../../services/dashboardService';
import { financialStore } from '../../services/financialStore';

export default function CardsScreen() {
  const { colors } = useTheme();
  const [cards, setCards] = useState([]);
  const [showNumbers, setShowNumbers] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const res = await cardService.getCards();
      if (res.success && isMounted) {
        setCards(res.data);
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

  const toggleFreeze = async (cardId) => {
    const res = await cardService.toggleFreeze(cardId);
    if (res.success) {
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFrozen: !c.isFrozen } : c))
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Virtual Cards</Text>
        <TouchableOpacity
          style={[styles.newCardBtn, { backgroundColor: colors.primaryLight }]}
          onPress={() => Alert.alert('New Card', 'Instant disposable virtual card generated and activated.')}
          activeOpacity={0.8}
        >
          <Plus size={16} color={colors.primary} />
          <Text style={[styles.newCardText, { color: colors.primary }]}>Get Card</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {cards.map((c) => (
          <View key={c.id} style={styles.cardSection}>
            <LinearGradient
              colors={c.isFrozen ? ['#3F4452', '#1E212A'] : c.colorGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGraphic}
            >
              <View style={styles.cardGraphicTop}>
                <View style={styles.typeBadge}>
                  <CreditCard size={12} color="#FFFFFF" />
                  <Text style={styles.cardType}>{c.type.toUpperCase()}</Text>
                </View>
                <Text style={styles.cardBrand}>{c.brand}</Text>
              </View>

              <Text style={styles.cardNumber}>
                {showNumbers ? (c.fullCardNumber || '4892  3819  2019  4892') : c.cardNumberMasked}
              </Text>

              <View style={styles.cardGraphicBottom}>
                <View>
                  <Text style={styles.cardHolderLabel}>CARDHOLDER</Text>
                  <Text style={styles.cardHolderName}>{c.cardholderName}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.cardHolderLabel}>EXPIRES / CVV</Text>
                  <Text style={styles.cardExpiry}>
                    {c.expiry} • {showNumbers ? (c.cvv || '842') : '•••'}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Spend limit tracking */}
            <View style={[styles.spendTracker, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.spendTrackerTop}>
                <Text style={[styles.spendLabel, { color: colors.textSecondary }]}>Monthly Limit Used</Text>
                <Text style={[styles.spendVal, { color: colors.text }]}>
                  ${c.currentSpend?.toFixed(2) || '0.00'} / ${c.monthlyLimit?.toLocaleString() || '5,000'}
                </Text>
              </View>
              <View style={styles.spendBarTrack}>
                <View
                  style={[
                    styles.spendBarFill,
                    {
                      width: `${Math.min(
                        Math.round(((c.currentSpend || 0) / (c.monthlyLimit || 5000)) * 100),
                        100
                      )}%`,
                      backgroundColor: c.accentColor || colors.primary,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={[styles.controlsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.controlItem}
                onPress={() => toggleFreeze(c.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.controlIcon, { backgroundColor: colors.cardSecondary }]}>
                  {c.isFrozen ? (
                    <Unlock size={18} color={colors.success} />
                  ) : (
                    <Lock size={18} color={colors.danger} />
                  )}
                </View>
                <Text style={[styles.controlLabel, { color: colors.text }]}>
                  {c.isFrozen ? 'Unfreeze' : 'Freeze'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlItem}
                onPress={() => setShowNumbers(!showNumbers)}
                activeOpacity={0.7}
              >
                <View style={[styles.controlIcon, { backgroundColor: colors.cardSecondary }]}>
                  {showNumbers ? (
                    <EyeOff size={18} color={colors.primary} />
                  ) : (
                    <Eye size={18} color={colors.primary} />
                  )}
                </View>
                <Text style={[styles.controlLabel, { color: colors.text }]}>
                  {showNumbers ? 'Hide Details' : 'Show Details'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlItem}
                onPress={() =>
                  Alert.alert(
                    'Online Spending Protection',
                    'Dynamic 3D-Secure simulation is active. Disposable card numbers rotate immediately after payment completion.'
                  )
                }
                activeOpacity={0.7}
              >
                <View style={[styles.controlIcon, { backgroundColor: colors.cardSecondary }]}>
                  <Globe size={18} color={colors.primary} />
                </View>
                <Text style={[styles.controlLabel, { color: colors.text }]}>Security</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={[styles.safetyNotice, { backgroundColor: colors.cardSecondary }]}>
          <ShieldCheck size={20} color={colors.success} />
          <Text style={[styles.safetyText, { color: colors.textSecondary }]}>
            All card numbers and CVVs are fictional simulation data. Instant freeze immediately blocks all simulated merchant debits.
          </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  newCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  newCardText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20,
  },
  cardSection: {
    gap: 12,
  },
  cardGraphic: {
    height: 195,
    borderRadius: 22,
    padding: 22,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  cardGraphicTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardType: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardBrand: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: 2,
  },
  cardGraphicBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHolderLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardHolderName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  cardExpiry: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  spendTracker: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  spendTrackerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spendLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  spendVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  spendBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  spendBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  controlsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  controlItem: {
    alignItems: 'center',
    gap: 6,
  },
  controlIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  safetyNotice: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 4,
  },
  safetyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
