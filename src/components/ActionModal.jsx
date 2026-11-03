import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { X, Check, ShieldCheck, ArrowRight, Repeat } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { getExchangeRate } from '../services/financialStore';

export default function ActionModal({
  visible,
  actionType,
  wallets = [],
  onClose,
  onAddMoney,
  onSubmitTransfer,
  onSubmitRequest,
  onSubmitExchange,
}) {
  const { colors } = useTheme();

  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const resetFields = () => {
    setAmount('');
    setRecipient('');
    setReference('');
    setStatusMessage('');
    setLoading(false);
  };

  const handleModalClose = () => {
    resetFields();
    onClose();
  };

  const handleAddSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setLoading(true);
    await onAddMoney(selectedCurrency, Number(amount));
    setLoading(false);
    setStatusMessage(`Successfully deposited ${selectedCurrency} ${Number(amount).toFixed(2)}`);
    setTimeout(handleModalClose, 1200);
  };

  const handleTransferSubmit = async () => {
    if (!amount || !recipient || Number(amount) <= 0) return;
    setLoading(true);
    const res = await onSubmitTransfer({
      recipientName: recipient,
      amount: Number(amount),
      currency: selectedCurrency,
      reference,
    });
    setLoading(false);
    if (res && res.success === false) {
      setStatusMessage(res.message);
    } else {
      setStatusMessage(`Transferred ${selectedCurrency} ${Number(amount).toFixed(2)} to ${recipient}`);
      setTimeout(handleModalClose, 1200);
    }
  };

  const handleRequestSubmit = async () => {
    if (!amount || !recipient || Number(amount) <= 0) return;
    setLoading(true);
    if (onSubmitRequest) {
      await onSubmitRequest({
        fromName: recipient,
        amount: Number(amount),
        currency: selectedCurrency,
        note: reference,
      });
    }
    setLoading(false);
    setStatusMessage(`Requested ${selectedCurrency} ${Number(amount).toFixed(2)} from ${recipient}`);
    setTimeout(handleModalClose, 1200);
  };

  const handleExchangeSubmit = async () => {
    if (!amount || Number(amount) <= 0 || selectedCurrency === targetCurrency) return;
    setLoading(true);
    if (onSubmitExchange) {
      const res = await onSubmitExchange({
        fromCurrency: selectedCurrency,
        toCurrency: targetCurrency,
        amount: Number(amount),
      });
      setLoading(false);
      if (res && res.success === false) {
        setStatusMessage(res.message);
      } else {
        const rate = getExchangeRate(selectedCurrency, targetCurrency);
        const converted = (Number(amount) * rate).toFixed(2);
        setStatusMessage(`Exchanged ${Number(amount).toFixed(2)} ${selectedCurrency} to ${converted} ${targetCurrency}`);
        setTimeout(handleModalClose, 1200);
      }
    } else {
      setLoading(false);
    }
  };

  const liveRate = getExchangeRate(selectedCurrency, targetCurrency);
  const convertedPreview = amount && !isNaN(Number(amount))
    ? (Number(amount) * liveRate).toFixed(2)
    : '0.00';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
        <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {actionType === 'add'
                ? 'Add Money (Simulation)'
                : actionType === 'send'
                ? 'Send Money'
                : actionType === 'request'
                ? 'Request Payment'
                : actionType === 'exchange'
                ? 'Exchange Currency'
                : 'Quick Financial Actions'}
            </Text>
            <TouchableOpacity onPress={handleModalClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
            {statusMessage ? (
              <View style={[styles.statusBox, { backgroundColor: colors.successLight }]}>
                <Check size={20} color={colors.success} />
                <Text style={[styles.statusText, { color: colors.success }]}>{statusMessage}</Text>
              </View>
            ) : actionType === 'add' ? (
              <View style={styles.body}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Select Wallet</Text>
                <View style={styles.currencyPills}>
                  {wallets.map((w) => (
                    <TouchableOpacity
                      key={w.currency}
                      style={[
                        styles.pill,
                        {
                          backgroundColor:
                            selectedCurrency === w.currency ? colors.primary : colors.chip,
                        },
                      ]}
                      onPress={() => setSelectedCurrency(w.currency)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          { color: selectedCurrency === w.currency ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {w.currency}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 14 }]}>
                  Enter Amount ({selectedCurrency})
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.cardSecondary, color: colors.text, borderColor: colors.border },
                  ]}
                  placeholder="100.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />

                <View style={styles.quickAmountRow}>
                  {[50, 100, 250, 500].map((quick) => (
                    <TouchableOpacity
                      key={quick}
                      style={[styles.quickBtn, { borderColor: colors.border }]}
                      onPress={() => setAmount(String(quick))}
                    >
                      <Text style={[styles.quickBtnText, { color: colors.text }]}>+{quick}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.actionBtnText}>Deposit to Simulated Wallet</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : actionType === 'send' ? (
              <View style={styles.body}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Recipient Name / RevTag</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.cardSecondary, color: colors.text, borderColor: colors.border },
                  ]}
                  placeholder="@username or Full Name"
                  placeholderTextColor={colors.textMuted}
                  value={recipient}
                  onChangeText={setRecipient}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>
                  Source Wallet
                </Text>
                <View style={styles.currencyPills}>
                  {wallets.map((w) => (
                    <TouchableOpacity
                      key={w.currency}
                      style={[
                        styles.pill,
                        {
                          backgroundColor:
                            selectedCurrency === w.currency ? colors.primary : colors.chip,
                        },
                      ]}
                      onPress={() => setSelectedCurrency(w.currency)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          { color: selectedCurrency === w.currency ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {w.currency}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>
                  Amount ({selectedCurrency})
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.cardSecondary, color: colors.text, borderColor: colors.border },
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>Reference</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.cardSecondary, color: colors.text, borderColor: colors.border },
                  ]}
                  placeholder="Dinner, rent, coffee..."
                  placeholderTextColor={colors.textMuted}
                  value={reference}
                  onChangeText={setReference}
                />

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  onPress={handleTransferSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.actionBtnText}>Confirm Instant Transfer</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : actionType === 'request' ? (
              <View style={styles.body}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Request From (Name or Tag)</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.cardSecondary, color: colors.text, borderColor: colors.border },
                  ]}
                  placeholder="@contact or Name"
                  placeholderTextColor={colors.textMuted}
                  value={recipient}
                  onChangeText={setRecipient}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>
                  Wallet Currency
                </Text>
                <View style={styles.currencyPills}>
                  {wallets.map((w) => (
                    <TouchableOpacity
                      key={w.currency}
                      style={[
                        styles.pill,
                        {
                          backgroundColor:
                            selectedCurrency === w.currency ? colors.primary : colors.chip,
                        },
                      ]}
                      onPress={() => setSelectedCurrency(w.currency)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          { color: selectedCurrency === w.currency ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {w.currency}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>
                  Amount to Request
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.cardSecondary, color: colors.text, borderColor: colors.border },
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />

                <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>Note</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.cardSecondary, color: colors.text, borderColor: colors.border },
                  ]}
                  placeholder="For trip, lunch split..."
                  placeholderTextColor={colors.textMuted}
                  value={reference}
                  onChangeText={setReference}
                />

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  onPress={handleRequestSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.actionBtnText}>Send Payment Request</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : actionType === 'exchange' ? (
              <View style={styles.body}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Convert From</Text>
                <View style={styles.currencyPills}>
                  {wallets.map((w) => (
                    <TouchableOpacity
                      key={w.currency}
                      style={[
                        styles.pill,
                        {
                          backgroundColor:
                            selectedCurrency === w.currency ? colors.primary : colors.chip,
                        },
                      ]}
                      onPress={() => {
                        setSelectedCurrency(w.currency);
                        if (targetCurrency === w.currency) {
                          const fallback = wallets.find((other) => other.currency !== w.currency);
                          if (fallback) setTargetCurrency(fallback.currency);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          { color: selectedCurrency === w.currency ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {w.currency}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>Convert To</Text>
                <View style={styles.currencyPills}>
                  {wallets
                    .filter((w) => w.currency !== selectedCurrency)
                    .map((w) => (
                      <TouchableOpacity
                        key={w.currency}
                        style={[
                          styles.pill,
                          {
                            backgroundColor:
                              targetCurrency === w.currency ? colors.primary : colors.chip,
                          },
                        ]}
                        onPress={() => setTargetCurrency(w.currency)}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            { color: targetCurrency === w.currency ? '#FFFFFF' : colors.text },
                          ]}
                        >
                          {w.currency}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>
                  Amount to Exchange ({selectedCurrency})
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.cardSecondary, color: colors.text, borderColor: colors.border },
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />

                {/* Conversion Preview Box */}
                <View style={[styles.exchangePreviewBox, { backgroundColor: colors.cardSecondary }]}>
                  <View style={styles.rateRow}>
                    <Repeat size={14} color={colors.primary} />
                    <Text style={[styles.rateText, { color: colors.textSecondary }]}>
                      1 {selectedCurrency} ≈ {liveRate.toFixed(4)} {targetCurrency}
                    </Text>
                  </View>
                  <View style={styles.rateRow}>
                    <ArrowRight size={14} color={colors.success} />
                    <Text style={[styles.convertedText, { color: colors.text }]}>
                      Receives: {convertedPreview} {targetCurrency}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  onPress={handleExchangeSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.actionBtnText}>Confirm Currency Exchange</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.body}>
                <View style={[styles.featurePreviewBox, { backgroundColor: colors.cardSecondary }]}>
                  <ShieldCheck size={28} color={colors.primary} />
                  <Text style={[styles.featurePreviewTitle, { color: colors.text }]}>
                    Simulation Ready
                  </Text>
                  <Text style={[styles.featurePreviewDesc, { color: colors.textSecondary }]}>
                    This financial tool connects directly to the simulated double-entry ledger. All currency rates and balances update immediately.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  onPress={handleModalClose}
                >
                  <Text style={styles.actionBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
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
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  currencyPills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  quickAmountRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  exchangePreviewBox: {
    padding: 14,
    borderRadius: 14,
    marginVertical: 12,
    gap: 6,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  convertedText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  statusBox: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  featurePreviewBox: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 18,
    gap: 10,
    marginVertical: 10,
  },
  featurePreviewTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  featurePreviewDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
