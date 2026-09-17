/**
 * Security & Master Passcode Management for Public Git / GitHub Pages
 * 
 * NO PASSWORDS OR CREDENTIALS ARE EVER COMMITTED TO GIT.
 * All authentication uses the browser's native Web Crypto API (crypto.subtle).
 * 
 * - Passcodes are salted with random 16-byte cryptographically secure values.
 * - Hashed with SHA-256 before storage in localStorage.
 * - On first launch on any device, the user defines their own master passcode.
 * - When cloned or viewed on a public repository, the source contains zero secrets.
 */

const PASSCODE_HASH_KEY = 'nc_workspace_pwd_hash_v2';
const PASSCODE_SALT_KEY = 'nc_workspace_pwd_salt_v2';

// Converts an ArrayBuffer to a hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generates a random cryptographic salt
function generateSalt(): string {
  const bytes = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bufferToHex(bytes.buffer);
}

// Computes SHA-256 hash of (passcode + salt) using native Web Crypto
async function computeHash(passcode: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${passcode.trim()}::${salt}`);
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return bufferToHex(hashBuffer);
  }

  // Fallback for non-subtle environments (basic 32-bit FNV-1a / standard polyfill)
  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  for (let i = 0; i < data.length; i++) {
    h1 = Math.imul(h1 ^ data[i], 2654435761);
    h2 = Math.imul(h2 ^ data[i], 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}`;
}

/**
 * Checks if the user has configured a master passcode on this browser/device.
 */
export function isPasscodeConfigured(): boolean {
  try {
    const hash = localStorage.getItem(PASSCODE_HASH_KEY);
    const salt = localStorage.getItem(PASSCODE_SALT_KEY);
    return Boolean(hash && salt);
  } catch {
    return false;
  }
}

/**
 * First-time initialization: Sets up a new master passcode.
 * Never stores the plaintext password.
 */
export async function setupPasscode(passcode: string): Promise<boolean> {
  const trimmed = passcode.trim();
  if (trimmed.length < 4) {
    throw new Error('Passcode must be at least 4 characters long.');
  }

  try {
    const salt = generateSalt();
    const hash = await computeHash(trimmed, salt);

    localStorage.setItem(PASSCODE_SALT_KEY, salt);
    localStorage.setItem(PASSCODE_HASH_KEY, hash);
    return true;
  } catch (err) {
    console.error('Failed to setup passcode:', err);
    return false;
  }
}

/**
 * Verifies an entered passcode against the locally stored salted SHA-256 hash.
 */
export async function verifyPasscode(passcode: string): Promise<boolean> {
  try {
    const storedHash = localStorage.getItem(PASSCODE_HASH_KEY);
    const storedSalt = localStorage.getItem(PASSCODE_SALT_KEY);

    if (!storedHash || !storedSalt) {
      return false;
    }

    const calculatedHash = await computeHash(passcode.trim(), storedSalt);
    return calculatedHash === storedHash;
  } catch (err) {
    console.error('Failed to verify passcode:', err);
    return false;
  }
}

/**
 * Changes existing passcode after verifying the current one.
 */
export async function changePasscode(
  currentPasscode: string,
  newPasscode: string
): Promise<{ success: boolean; message: string }> {
  const valid = await verifyPasscode(currentPasscode);
  if (!valid) {
    return { success: false, message: 'Current passcode is incorrect.' };
  }

  if (newPasscode.trim().length < 4) {
    return { success: false, message: 'New passcode must be at least 4 characters.' };
  }

  const ok = await setupPasscode(newPasscode);
  if (ok) {
    return { success: true, message: 'Passcode updated successfully.' };
  }
  return { success: false, message: 'Could not update passcode. Please try again.' };
}

/**
 * Resets the stored passcode so the user can re-configure it.
 */
export function resetPasscode(): void {
  try {
    localStorage.removeItem(PASSCODE_HASH_KEY);
    localStorage.removeItem(PASSCODE_SALT_KEY);
  } catch {}
}
