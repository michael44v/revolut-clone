import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Unlock, Plus, ShieldCheck, Eye, EyeOff, Globe } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { cardService } from '../../services/dashboardService';

export default function CardsScreen() {
  const { colors } = useTheme();
  const [cards, setCards] = useState([]);
  const [showNumbers, setShowNumbers] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await cardService.getCards();
      if (res.success) setCards(res.data);
    }
    load();
  }, []);

  const toggleFreeze = (cardId) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFrozen: !c.isFrozen } : c))
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Virtual Cards</Text>
        <TouchableOpacity
          style={[styles.newCardBtn, { backgroundColor: colors.primaryLight }]}
          onPress={() => Alert.alert('New Card', 'Instant disposable virtual card created.')}
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
                <Text style={styles.cardType}>{c.type.toUpperCase()}</Text>
                <Text style={styles.cardBrand}>{c.brand}</Text>
              </View>

              <Text style={styles.cardNumber}>
                {showNumbers ? '4892  3819  2019  4892' : c.cardNumberMasked}
              </Text>

              <View style={styles.cardGraphicBottom}>
                <View>
                  <Text style={styles.cardHolderLabel}>CARDHOLDER</Text>
                  <Text style={styles.cardHolderName}>{c.cardholderName}</Text>
                </View>
                <View>
                  <Text style={styles.cardHolderLabel}>EXPIRES</Text>
                  <Text style={styles.cardExpiry}>{c.expiry}</Text>
                </View>
              </View>
            </LinearGradient>

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
                  {c.isFrozen ? 'Unfreeze' : 'Freeze Card'}
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
                    'Online Payments',
                    'Online simulated e-commerce transactions are currently ACTIVE.'
                  )
                }
                activeOpacity={0.7}
              >
                <View style={[styles.controlIcon, { backgroundColor: colors.cardSecondary }]}>
                  <Globe size={18} color={colors.primary} />
                </View>
                <Text style={[styles.controlLabel, { color: colors.text }]}>Online Pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={[styles.safetyNotice, { backgroundColor: colors.cardSecondary }]}>
          <ShieldCheck size={20} color={colors.success} />
          <Text style={[styles.safetyText, { color: colors.textSecondary }]}>
            All card numbers and CVVs are fictional simulation data. No real card networks are accessed.
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
  cardType: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  cardBrand: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 20,
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
