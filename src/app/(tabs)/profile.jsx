import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Shield,
  Moon,
  Sun,
  Smartphone,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  ScanFace,
  Bell,
  Camera,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { biometricsService } from '../../utils/biometrics';
import { storage } from '../../utils/storage';

const BIOMETRICS_PREF_KEY = 'app_biometrics_enabled';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { user, isDemoUser, logout, updateUser } = useAuth();

  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Face ID');
  const [pushNotifsEnabled, setPushNotifsEnabled] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    async function checkBio() {
      const bioInfo = await biometricsService.isAvailable();
      setBiometricType(bioInfo.type);
      const savedBio = await storage.getItem(BIOMETRICS_PREF_KEY);
      if (savedBio !== null) {
        setBiometricsEnabled(savedBio === 'true');
      }
    }
    checkBio();
  }, []);

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Please allow photo gallery access to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setUploadingAvatar(true);

        const imagePayload = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;

        // Persist to MySQL database via PHP API
        const res = await authService.updateAvatar(imagePayload);
        setUploadingAvatar(false);

        if (res.success) {
          const newAvatar = res.data?.avatarUrl || asset.uri;
          updateUser({ avatar: newAvatar });
          Alert.alert('Success', 'Profile picture updated successfully in the database.');
        } else {
          // Even if offline, update client preview
          updateUser({ avatar: asset.uri });
        }
      }
    } catch (_e) {
      setUploadingAvatar(false);
      Alert.alert('Error', 'Could not update profile picture.');
    }
  };

  const toggleBiometrics = async (val) => {
    if (val) {
      const auth = await biometricsService.authenticate(`Enable ${biometricType} for instant sign-in`);
      if (auth.success) {
        setBiometricsEnabled(true);
        await storage.setItem(BIOMETRICS_PREF_KEY, 'true');
      }
    } else {
      setBiometricsEnabled(false);
      await storage.setItem(BIOMETRICS_PREF_KEY, 'false');
    }
  };

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
        {/* User Card with Interactive Avatar Changer */}
        <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.avatarTouchable}
            onPress={handlePickAvatar}
            activeOpacity={0.8}
            disabled={uploadingAvatar}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
            )}
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Camera size={14} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>

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
            <TouchableOpacity onPress={handlePickAvatar} style={{ marginTop: 2 }}>
              <Text style={[styles.changePhotoText, { color: colors.primary }]}>
                Tap avatar to change photo
              </Text>
            </TouchableOpacity>
            <View style={[styles.planBadge, { backgroundColor: colors.chip }]}>
              <Text style={[styles.planBadgeText, { color: colors.text }]}>
                {user?.tier || (isDemoUser ? 'Metal Premium' : 'Standard')} Plan
              </Text>
            </View>
          </View>
        </View>

        {/* Security & Biometrics Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>SECURITY & BIOMETRICS</Text>
          <View style={[styles.sectionGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.cardSecondary }]}>
                  <ScanFace size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>{biometricType}</Text>
                  <Text style={[styles.menuSub, { color: colors.textSecondary }]}>
                    Unlock account securely
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={toggleBiometrics}
                thumbColor="#FFFFFF"
                trackColor={{ false: '#D1D5DB', true: colors.primary }}
              />
            </View>

            <TouchableOpacity
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: colors.borderSubtle }]}
              onPress={() => Alert.alert('Security & PIN', 'Passcode protection is currently set to 4-digit simulation PIN.')}
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

            <View style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: colors.borderSubtle }]}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.cardSecondary }]}>
                  <Bell size={18} color={colors.primary} />
                </View>
                <Text style={[styles.menuTitle, { color: colors.text }]}>Push Notifications</Text>
              </View>
              <Switch
                value={pushNotifsEnabled}
                onValueChange={setPushNotifsEnabled}
                thumbColor="#FFFFFF"
                trackColor={{ false: '#D1D5DB', true: colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* System & Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>SYSTEM & ARCHITECTURE</Text>
          <View style={[styles.sectionGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert(
                  'About FinTech System',
                  'Revolut-inspired Fintech App.\nBackend: Procedural PHP 8.2+ with MySQLi prepared statements.\nDatabase: Double-entry ledger with integer minor units.'
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.cardSecondary }]}>
                  <HelpCircle size={18} color={colors.primary} />
                </View>
                <Text style={[styles.menuTitle, { color: colors.text }]}>Database & Architecture</Text>
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
  avatarTouchable: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
  changePhotoText: {
    fontSize: 11,
    fontWeight: '600',
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
