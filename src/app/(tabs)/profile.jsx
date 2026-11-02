import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Shield,
  Moon,
  Sun,
  Smartphone,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { user, isDemoUser, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const displayName = user?.name || 'Alex Rivera';
  const displayEmail = user?.email || 'alex.rivera@example.com';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profile & Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <View style={styles.userTitleRow}>
              <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
              {isDemoUser && (
                <View style={[styles.demoBadge, { backgroundColor: colors.primaryLight }]}>
                  <Sparkles size={10} color={colors.primary} />
                  <Text style={[styles.demoBadgeText, { color: colors.primary }]}>Demo</Text>
                </View>
              )}
            </View>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{displayEmail}</Text>
            <View style={[styles.planBadge, { backgroundColor: colors.chip }]}>
              <Text style={[styles.planBadgeText, { color: colors.text }]}>
                {user?.tier || 'Metal Premium'} Plan
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>PREFERENCES</Text>
          <View style={[styles.sectionGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.cardSecondary }]}>
                  {isDark ? (
                    <Moon size={18} color={colors.primary} />
                  ) : (
                    <Sun size={18} color={colors.primary} />
                  )}
                </View>
                <Text style={[styles.menuTitle, { color: colors.text }]}>Dark Theme</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
                thumbColor="#FFFFFF"
                trackColor={{ false: '#D1D5DB', true: colors.primary }}
              />
            </View>

            <TouchableOpacity
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: colors.borderSubtle }]}
              onPress={() => {
                const modes = ['light', 'dark', 'system'];
                const nextIdx = (modes.indexOf(themeMode) + 1) % modes.length;
                setThemeMode(modes[nextIdx]);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.cardSecondary }]}>
                  <Smartphone size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>Theme Mode</Text>
                  <Text style={[styles.menuSub, { color: colors.textSecondary }]}>
                    Current: {themeMode.toUpperCase()}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security & Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>SECURITY & SYSTEM</Text>
          <View style={[styles.sectionGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Security', 'Simulated biometric & PIN settings are active.')}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.cardSecondary }]}>
                  <Shield size={18} color={colors.primary} />
                </View>
                <Text style={[styles.menuTitle, { color: colors.text }]}>Security & PIN</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: colors.borderSubtle }]}
              onPress={() =>
                Alert.alert(
                  'About Simulation',
                  'Revolut-inspired Fintech Simulator.\nProcedural PHP Backend Ready.\nReact Native Expo JS Only.'
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.cardSecondary }]}>
                  <HelpCircle size={18} color={colors.primary} />
                </View>
                <Text style={[styles.menuTitle, { color: colors.text }]}>Help & Simulation Info</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.dangerLight }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={colors.danger} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutBtnText, { color: colors.danger }]}>Log Out of Account</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
    gap: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sectionGroup: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuSub: {
    fontSize: 12,
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    marginTop: 10,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
