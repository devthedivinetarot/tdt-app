import React, { useEffect, useState } from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import PressableScale from './PressableScale';
import { buildOptions, serverVerifyEnabled } from '../lib/razorpay';
import { createOrder, verifyPayment } from '../lib/payments';
import { colors, spacing, font } from '../theme';

// Native Razorpay Checkout via a WebView loading the official checkout.js.
// Secure flow (when PAYMENTS_ENDPOINT is set): create a server Order first,
// then verify the signature server-side before calling onSuccess.
export default function RazorpayCheckout({ visible, amount, description, prefill, onSuccess, onClose }) {
  const [phase, setPhase] = useState('idle'); // idle | prepping | checkout | verifying | error
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!visible) { setPhase('idle'); setOrderId(null); return; }
    (async () => {
      if (serverVerifyEnabled()) {
        setPhase('prepping');
        const id = await createOrder({ amount, notes: { description: description || '' } });
        if (cancelled) return;
        if (!id) { setPhase('error'); return; }
        setOrderId(id); setPhase('checkout');
      } else {
        setOrderId(null); setPhase('checkout');
      }
    })();
    return () => { cancelled = true; };
  }, [visible]); // eslint-disable-line

  const options = buildOptions({ amount, description, prefill, orderId });
  const html = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>html,body{margin:0;height:100%;background:#0b0710}</style>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head><body>
<script>
  var post = function (m) { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(m)); };
  try {
    var options = ${JSON.stringify(options)};
    options.handler = function (resp) {
      post({ type: 'success', payment_id: resp.razorpay_payment_id, order_id: resp.razorpay_order_id, signature: resp.razorpay_signature });
    };
    options.modal = { ondismiss: function () { post({ type: 'dismiss' }); } };
    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function (resp) { post({ type: 'failed', error: resp.error && resp.error.description }); });
    rzp.open();
  } catch (e) { post({ type: 'error', error: String(e) }); }
</script>
</body></html>`;

  const handleMessage = async (e) => {
    let m = {};
    try { m = JSON.parse(e.nativeEvent.data); } catch (err) {}
    if (m.type !== 'success') { onClose && onClose(); return; }
    if (serverVerifyEnabled()) {
      setPhase('verifying');
      const ok = await verifyPayment({ orderId: m.order_id, paymentId: m.payment_id, signature: m.signature });
      if (ok) onSuccess && onSuccess(m.payment_id);
      else setPhase('error'); // verification failed — do NOT unlock
    } else {
      onSuccess && onSuccess(m.payment_id);
    }
  };

  const overlayText =
    phase === 'verifying' ? 'Verifying your payment…'
    : phase === 'error' ? 'Payment could not be verified. If money was deducted it will be auto-refunded.'
    : 'Preparing secure checkout…';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        {phase === 'checkout' && visible ? (
          <WebView
            source={{ html }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            onMessage={handleMessage}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.center}><ActivityIndicator color={colors.gold} size="large" /></View>
            )}
            style={{ backgroundColor: colors.bgDeep }}
          />
        ) : (
          <View style={styles.center}>
            <ActivityIndicator color={colors.gold} size="large" />
            <Text style={styles.msg}>{overlayText}</Text>
            {phase === 'error' ? (
              <PressableScale onPress={onClose} style={styles.closeBtn}><Text style={styles.closeText}>Close</Text></PressableScale>
            ) : null}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgDeep },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgDeep, padding: spacing.xl, gap: spacing.md },
  msg: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', lineHeight: 20 },
  closeBtn: { marginTop: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 24, paddingVertical: 10 },
  closeText: { color: colors.text, fontWeight: '700' },
});
