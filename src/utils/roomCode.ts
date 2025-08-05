// Exclude similar looking characters (0/O, 1/I)
const SAFE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 8;

export function generateRoomCode(): string {
  const array = new Uint32Array(ROOM_CODE_LENGTH);
  crypto.getRandomValues(array);
  
  return Array.from(array)
    .map(x => SAFE_CHARACTERS[x % SAFE_CHARACTERS.length])
    .join('');
}

export function isValidRoomCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const normalizedCode = code.toUpperCase().trim();
  return normalizedCode.length === ROOM_CODE_LENGTH && 
         normalizedCode.split('').every(char => SAFE_CHARACTERS.includes(char));
}

export function formatRoomCode(code: string): string {
  const normalizedCode = code.toUpperCase().trim();
  return normalizedCode.length === ROOM_CODE_LENGTH 
    ? `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4)}`
    : normalizedCode;
}
