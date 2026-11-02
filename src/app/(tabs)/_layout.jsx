import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, CreditCard, ArrowLeftRight, BarChart3, User } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

function CustomTabBar({ state, descriptors, navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const activeColor = colors.primary;
        const inactiveColor = colors.textSecondary;
        const iconSize = 22;

        let IconComponent = Home;
        if (route.name === 'cards') IconComponent = CreditCard;
        if (route.name === 'payments') IconComponent = ArrowLeftRight;
        if (route.name === 'analytics') IconComponent = BarChart3;
        if (route.name === 'profile') IconComponent = User;

        const label = options.tabBarLabel || route.name;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={label}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabButton}
          >
            <View style={[styles.iconWrapper, isFocused && { backgroundColor: colors.primaryLight }]}>
              <IconComponent
                size={iconSize}
                color={isFocused ? activeColor : inactiveColor}
                strokeWidth={isFocused ? 2.4 : 1.8}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? activeColor : inactiveColor,
                  fontWeight: isFocused ? '600' : '500',
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          tabBarLabel: 'Cards',
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          tabBarLabel: 'Payments',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarLabel: 'Analytics',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});
