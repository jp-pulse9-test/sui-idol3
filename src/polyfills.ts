// Polyfills for Node.js modules in browser
import { Buffer } from 'buffer';
import process from 'process';

// Set global variables
window.global = window;
globalThis.global = globalThis;

// Set Buffer globally
window.Buffer = Buffer;
globalThis.Buffer = Buffer;

// Set process globally
window.process = process;
globalThis.process = process;

// Ensure process.env exists
if (!process.env) {
  process.env = {};
}

export {};
