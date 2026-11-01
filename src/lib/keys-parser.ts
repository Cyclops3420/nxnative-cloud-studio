export interface KeysValidationResult {
  isValid: boolean;
  totalKeys: number;
  hasHeaderKey: boolean;
  hasKeyAreaKeys: boolean;
  hasTitleKek: boolean;
  hasMasterKeys: boolean;
  masterKeyCount: number;
  highestMasterKey: number;
  missingEssentialKeys: string[];
  rawText: string;
}

const ESSENTIAL_KEYS = [
  'header_key',
  'key_area_key_application_source',
  'key_area_key_ocean_source',
  'key_area_key_system_source',
  'titlekek_source',
  'master_key_00',
];

export function parseProdKeys(content: string): KeysValidationResult {
  const lines = content.split(/\r?\n/);
  const detectedKeys = new Map<string, string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
      continue;
    }

    const equalIndex = trimmed.indexOf('=');
    if (equalIndex > 0) {
      const keyName = trimmed.substring(0, equalIndex).trim().toLowerCase();
      const keyValue = trimmed.substring(equalIndex + 1).trim();

      // Verify that value looks like hex (32, 64, or 128 characters)
      if (/^[0-9a-fA-F\s]+$/.test(keyValue)) {
        detectedKeys.set(keyName, keyValue.replace(/\s+/g, ''));
      }
    }
  }

  const hasHeaderKey = detectedKeys.has('header_key');
  const hasKeyAreaKeys =
    detectedKeys.has('key_area_key_application_source') ||
    detectedKeys.has('key_area_key_system_source');
  const hasTitleKek = detectedKeys.has('titlekek_source');
  
  let masterKeyCount = 0;
  let highestMasterKey = -1;

  for (let i = 0; i <= 32; i++) {
    const keyPadded = i.toString().padStart(2, '0');
    if (detectedKeys.has(`master_key_${keyPadded}`)) {
      masterKeyCount++;
      highestMasterKey = Math.max(highestMasterKey, i);
    }
  }

  const missingEssentialKeys: string[] = [];
  for (const essential of ESSENTIAL_KEYS) {
    if (!detectedKeys.has(essential)) {
      missingEssentialKeys.push(essential);
    }
  }

  const isValid = detectedKeys.size >= 5 && hasHeaderKey && masterKeyCount > 0;

  return {
    isValid,
    totalKeys: detectedKeys.size,
    hasHeaderKey,
    hasKeyAreaKeys,
    hasTitleKek,
    hasMasterKeys: masterKeyCount > 0,
    masterKeyCount,
    highestMasterKey,
    missingEssentialKeys,
    rawText: content,
  };
}
