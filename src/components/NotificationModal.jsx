import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  X,
  Shield,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Repeat,
  CheckCheck,
  Bell,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const NOTIF_ICONS = {
  Shield,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Repeat,
  Bell,
};

export default function NotificationModal({
  visible,
  notifications = [],
  unreadCount = 0,
  onClose,
  onMarkAllAsRead,
}) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
        <View style={[styles.sheetContainer, { backgroundColor: colors.card }]}>
          {/* Top Grabber */}
          <View style={styles.grabberWrapper}>
            <View style={[styles.grabber, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
              {unreadCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{unreadCount} new</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.headerActions}>
              {unreadCount > 0 ? (
                <TouchableOpacity
                  style={[styles.markReadBtn, { backgroundColor: colors.cardSecondary }]}
                  onPress={onMarkAllAsRead}
                  activeOpacity={0.7}
                >
                  <CheckCheck size={14} color={colors.primary} />
                  <Text style={[styles.markReadText, { color: colors.primary }]}>
                    Mark all read
                  </Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notification List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyBox}>
                <Bell size={36} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  You&apos;re all caught up with your simulated account alerts.
                </Text>
              </View>
            ) : (
              notifications.map((item) => {
                const IconComponent = NOTIF_ICONS[item.icon] || Bell;
                const isUnread = !item.read;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.notifCard,
                      {
                        backgroundColor: isUnread ? colors.primaryLight : colors.cardSecondary,
                        borderColor: isUnread ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: isUnread ? colors.primary : colors.card,
                        },
                      ]}
                    >
                      <IconComponent
                        size={18}
                        color={isUnread ? '#FFFFFF' : colors.primary}
                      />
                    </View>

                    <View style={styles.contentCol}>
                      <View style={styles.cardTopRow}>
                        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                          {item.time}
                        </Text>
                      </View>
                      <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                        {item.message}
                      </Text>
                    </View>

                    {isUnread ? <View style={[styles.dot, { backgroundColor: colors.primary }]} /> : null}
                  </View>
                );
              })
            )}

            <View style={[styles.futureNotice, { borderColor: colors.border }]}>
              <Text style={[styles.futureNoticeText, { color: colors.textMuted }]}>
                Full notification archive and push-preference channels will be accessible in Phase 2.
              </Text>
              <ChevronRight size={14} color={colors.textMuted} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '82%',
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 12,
  },
  grabberWrapper: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 16,
  },
  notifCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCol: {
    flex: 1,
    gap: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  timeText: {
    fontSize: 11,
  },
  messageText: {
    fontSize: 12,
    lineHeight: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
  },
  futureNotice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  futureNoticeText: {
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
});
