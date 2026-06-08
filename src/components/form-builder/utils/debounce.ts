export interface DebouncedFn<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): void;
  /** Cancel the pending invocation, if any. */
  cancel(): void;
}

export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number,
): DebouncedFn<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func(...args);
    }, wait);
  };

  debounced.cancel = (): void => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}
