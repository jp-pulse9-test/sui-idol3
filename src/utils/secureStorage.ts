// Simple encryption for wallet addresses in localStorage
// Note: This is basic obfuscation for demo purposes
// In production, consider using more robust encryption or secure storage

const STORAGE_KEY = 'sui_idol_data';
const SIMPLE_KEY = 'sui_idol_secret_2024';

export const secureStorage = {
  // Simple XOR encryption for basic obfuscation
  encrypt: (text: string): string => {
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      encrypted += String.fromCharCode(
        text.charCodeAt(i) ^ SIMPLE_KEY.charCodeAt(i % SIMPLE_KEY.length)
      );
    }
    return btoa(encrypted);
  },

  decrypt: (encrypted: string): string => {
    try {
      const text = atob(encrypted);
      let decrypted = '';
      for (let i = 0; i < text.length; i++) {
        decrypted += String.fromCharCode(
          text.charCodeAt(i) ^ SIMPLE_KEY.charCodeAt(i % SIMPLE_KEY.length)
        );
      }
      return decrypted;
    } catch {
      return '';
    }
  },

  setWalletAddress: (address: string): void => {
    const encrypted = secureStorage.encrypt(address);
    localStorage.setItem(STORAGE_KEY, encrypted);
  },

  getWalletAddress: (): string | null => {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;
    return secureStorage.decrypt(encrypted);
  },

  removeWalletAddress: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  }
};