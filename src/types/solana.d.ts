/**
 * Solana Phantom wallet type definitions
 */

interface PhantomProvider {
  connect(): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  on(event: string, handler: (...args: any[]) => void): void;
  isPhantom?: boolean;
  publicKey?: { toString(): string };
}

interface Window {
  solana?: PhantomProvider;
}
