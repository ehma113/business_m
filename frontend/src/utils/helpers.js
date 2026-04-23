// This ensures toast NEVER crashes your state updates
export function safeToast(toastFn, message, type) {
  try {
    toastFn(message, type);
  } catch (e) {
    console.warn('Toast failed:', e);
  }
}