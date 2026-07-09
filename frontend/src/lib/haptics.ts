export const haptics = {
  light: () => { if (typeof navigator !== 'undefined') navigator.vibrate?.(10); },
  medium: () => { if (typeof navigator !== 'undefined') navigator.vibrate?.(20); },
  heavy: () => { if (typeof navigator !== 'undefined') navigator.vibrate?.(35); },
  success: () => { if (typeof navigator !== 'undefined') navigator.vibrate?.([10, 50, 10]); },
  error: () => { if (typeof navigator !== 'undefined') navigator.vibrate?.([20, 30, 20, 30, 20]); },
  selection: () => { if (typeof navigator !== 'undefined') navigator.vibrate?.(5); }
};
