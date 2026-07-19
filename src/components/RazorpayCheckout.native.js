import React from 'react';
import { Modal, View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { buildOptions } from '../lib/razorpay';
import { colors } from '../theme';

// Native Razorpay Checkout via a WebView loading the official checkout.js.
// Needs only the public Key ID. Posts the result back to RN.
export default function RazorpayCheckout({ visible, amount, description, prefill, onSuccess, onClose }) {
  const options = buildOptions({ amount, description, prefill });
  const html = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>html,body{margin:0;height:100%;background:#0b0710}</style>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head><body>
<script>
  var post = function (m) { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(m)); };
  try {
    var options = ${JSON.stringify(options)};
    options.handler = function (resp) { post({ type: 'success', id: resp.razorpay_payment_id }); };
    options.modal = { ondismiss: function () { post({ type: 'dismiss' }); } };
    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function (resp) { post({ type: 'failed', error: resp.error && resp.error.description }); });
    rzp.open();
  } catch (e) { post({ type: 'error', error: String(e) }); }
</script>
</body></html>`;

  const handleMessage = (e) => {
    let m = {};
    try { m = JSON.parse(e.nativeEvent.data); } catch (err) {}
    if (m.type === 'success') onSuccess && onSuccess(m.id);
    else onClose && onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        {visible ? (
          <WebView
            source={{ html }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            onMessage={handleMessage}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}><ActivityIndicator color={colors.gold} size="large" /></View>
            )}
            style={{ backgroundColor: colors.bgDeep }}
          />
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgDeep },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgDeep },
});
