import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Plus, Send, ArrowDownLeft, Repeat, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const ACTIONS = [
  { id: 'add', label: 'Add money', icon: Plus },
  { id: 'send', label: 'Send', icon: Send },
  { id: 'request', label: 'Request', icon: ArrowDownLeft },
  { id: 'exchange', label: 'Exchange', icon: Repeat },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

export default function QuickActions({ onActionPress }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {ACTIONS.map((action) => {
        const IconComponent = action.icon;
        return (
          <TouchableOpacity
            key={action.id}
            style={styles.actionBtn}
            onPress={() => onActionPress(action.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <IconComponent size={22} color={colors.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]} numberOfLines={1}>
              {action.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
