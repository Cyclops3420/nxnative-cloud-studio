export interface SwitchFileMetadata {
  fileName: string;
  fileSize: number;
  formattedSize: string;
  extension: 'nsp' | 'nsz' | 'xci' | 'xcz' | 'nro' | 'unknown';
  magicDetected: string;
  isValidHeader: boolean;
  detectedTitleId?: string;
  detectedVersion?: string;
  category: 'Base Game' | 'Update' | 'DLC' | 'Homebrew App' | 'Unknown';
  internalFiles?: string[];
  suggestedName?: string;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function parseSwitchFileHeader(file: File): Promise<SwitchFileMetadata> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const extension = (['nsp', 'nsz', 'xci', 'xcz', 'nro'].includes(ext) ? ext : 'unknown') as SwitchFileMetadata['extension'];

  // Detect title id from filename: [0100XXXXXXXXXXXX]
  const titleIdMatch = file.name.match(/\[([0-9a-fA-F]{16})\]/);
  const detectedTitleId = titleIdMatch ? titleIdMatch[1].toUpperCase() : undefined;

  // Detect version: [vXXXXXX] or [v0]
  const versionMatch = file.name.match(/\[v([0-9]+)\]/i);
  const detectedVersion = versionMatch ? `v${versionMatch[1]}` : undefined;

  // Categorize based on Title ID suffix
  let category: SwitchFileMetadata['category'] = 'Unknown';
  if (extension === 'nro') {
    category = 'Homebrew App';
  } else if (detectedTitleId) {
    if (detectedTitleId.endsWith('000')) {
      category = 'Base Game';
    } else if (detectedTitleId.endsWith('800')) {
      category = 'Update';
    } else {
      category = 'DLC';
    }
  } else if (file.name.toLowerCase().includes('update') || (detectedVersion && detectedVersion !== 'v0')) {
    category = 'Update';
  } else if (file.name.toLowerCase().includes('dlc')) {
    category = 'DLC';
  } else {
    category = 'Base Game';
  }

  // Extract clean suggested name
  let suggestedName = file.name.replace(/\.[^/.]+$/, '');
  suggestedName = suggestedName.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();

  // Read the first 4096 bytes to inspect magic headers
  const headerSlice = file.slice(0, 4096);
  const buffer = await headerSlice.arrayBuffer();
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let magicDetected = 'NONE';
  let isValidHeader = false;
  const internalFiles: string[] = [];

  try {
    // Check PFS0 (Standard NSP / NSZ): 'PFS0' = 0x50 0x46 0x53 0x30
    if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x46 && bytes[2] === 0x53 && bytes[3] === 0x30) {
      magicDetected = 'PFS0 (NSP Partition)';
      isValidHeader = true;

      // Parse PFS0 Header
      if (bytes.length >= 16) {
        const numFiles = view.getUint32(4, true);
        const stringTableSize = view.getUint32(8, true);
        
        // File entries start at offset 16. Each is 24 bytes:
        // offset 0: data_offset (8 bytes)
        // offset 8: size (8 bytes)
        // offset 16: string_table_offset (4 bytes)
        // offset 20: reserved (4 bytes)
        const stringTableStart = 16 + (numFiles * 24);
        
        if (stringTableStart + stringTableSize <= bytes.length) {
          for (let i = 0; i < Math.min(numFiles, 12); i++) {
            const entryOffset = 16 + (i * 24);
            const strOffset = view.getUint32(entryOffset + 16, true);
            const actualStrPos = stringTableStart + strOffset;
            
            // Read null-terminated string
            let fileName = '';
            for (let j = actualStrPos; j < bytes.length && bytes[j] !== 0; j++) {
              fileName += String.fromCharCode(bytes[j]);
            }
            if (fileName) {
              internalFiles.push(fileName);
            }
          }
        }
      }
    } 
    // Check HFS0 (XCI Partition): 'HFS0' = 0x48 0x46 0x53 0x30
    else if (bytes.length >= 4 && bytes[0] === 0x48 && bytes[1] === 0x46 && bytes[2] === 0x53 && bytes[3] === 0x30) {
      magicDetected = 'HFS0 (XCI Root)';
      isValidHeader = true;
    }
    // Check XCI Cartridge Header: offset 0x100 has 'HEAD' magic: 0x48 0x45 0x41 0x44
    else if (bytes.length >= 0x104 && bytes[0x100] === 0x48 && bytes[0x101] === 0x45 && bytes[0x102] === 0x41 && bytes[0x103] === 0x44) {
      magicDetected = 'HEAD (XCI Cartridge)';
      isValidHeader = true;
    }
    // Check NRO: offset 0x10 has 'NRO0': 0x4E 0x52 0x4F 0x30
    else if (bytes.length >= 0x14 && bytes[0x10] === 0x4E && bytes[0x11] === 0x52 && bytes[0x12] === 0x4F && bytes[0x13] === 0x30) {
      magicDetected = 'NRO0 (Homebrew Executable)';
      isValidHeader = true;
      category = 'Homebrew App';
    } else {
      // Could be encrypted or compressed without raw header in first 4KB
      magicDetected = extension === 'unknown' ? 'Unknown' : `${extension.toUpperCase()} (Encrypted Stream)`;
      isValidHeader = ['nsp', 'nsz', 'xci', 'xcz', 'nro'].includes(extension);
    }
  } catch (err) {
    console.warn('Error reading switch binary header:', err);
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    formattedSize: formatBytes(file.size),
    extension,
    magicDetected,
    isValidHeader,
    detectedTitleId,
    detectedVersion,
    category,
    internalFiles: internalFiles.length > 0 ? internalFiles : undefined,
    suggestedName: suggestedName || 'Switch Game',
  };
}
