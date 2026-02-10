export const withTimeout = <T>(
  promise: Promise<T>,
  ms = 60000
): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("AI_TIMEOUT")), ms)
  );

  return Promise.race([promise, timeout]);
};
