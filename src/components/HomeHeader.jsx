import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell, Sparkles } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function HomeHeader({ onNotificationPress, onProfilePress }) {
  const { colors } = useTheme();
  const { user, isDemoUser } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name || 'Alex Rivera';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileRow}
        onPress={onProfilePress}
        activeOpacity={0.8}
      >
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        )}
        <View style={styles.nameContainer}>
          <View style={styles.greetingRow}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()}
            </Text>
            {isDemoUser && (
              <View style={[styles.demoTag, { backgroundColor: colors.primaryLight }]}>
                <Sparkles size={10} color={colors.primary} />
                <Text style={[styles.demoTagText, { color: colors.primary }]}>Demo</Text>
              </View>
            )}
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={onNotificationPress}
        activeOpacity={0.7}
      >
        <Bell size={20} color={colors.text} />
        <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  nameContainer: {
    gap: 2,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '500',
  },
  demoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  demoTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
