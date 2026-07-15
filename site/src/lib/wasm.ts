export async function loadOptionalWasmModule<T>(loader: () => Promise<T>): Promise<T | null> {
  try {
    return await loader();
  } catch (error) {
    console.warn('Optional WebAssembly module failed to load; using JavaScript fallback.', error);
    return null;
  }
}
