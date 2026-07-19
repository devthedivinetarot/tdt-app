import { Platform } from 'react-native';

// Web-only: silence a couple of benign deprecation warnings that come from
// DEPENDENCIES we don't control (React Navigation / react-native-web emit the
// legacy `pointerEvents` prop and `shadow*` style-prop deprecations internally).
// This filters ONLY those exact messages — every other log passes through.
if (Platform.OS === 'web' && typeof console !== 'undefined') {
  const IGNORE = [
    'props.pointerEvents is deprecated',
    '"shadow*" style props are deprecated',
  ];
  const shouldDrop = (args) => {
    const first = args && args.length ? args[0] : '';
    return typeof first === 'string' && IGNORE.some((s) => first.includes(s));
  };
  ['warn', 'error'].forEach((level) => {
    const orig = console[level] ? console[level].bind(console) : null;
    if (orig) {
      console[level] = (...args) => {
        if (shouldDrop(args)) return;
        orig(...args);
      };
    }
  });
}
