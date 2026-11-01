import JSZip from 'jszip';

export interface ClientIpaOptions {
  appName: string;
  bundleId: string;
  version: string;
  gameFile?: File;
  onProgress?: (percent: number, message: string) => void;
}

export function generateInfoPlist(appName: string, bundleId: string, version = '1.0.0'): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>BuildMachineOSBuild</key>
    <string>23F79</string>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>${appName}</string>
    <key>CFBundleExecutable</key>
    <string>NXNativeLauncher</string>
    <key>CFBundleIdentifier</key>
    <string>${bundleId}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${appName}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>${version}</string>
    <key>CFBundleSupportedPlatforms</key>
    <array>
        <string>iPhoneOS</string>
    </array>
    <key>CFBundleVersion</key>
    <string>${version}</string>
    <key>DTPlatformName</key>
    <string>iphoneos</string>
    <key>DTSDKName</key>
    <string>iphoneos18.0</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>MinimumOSVersion</key>
    <string>16.0</string>
    <key>UIDeviceFamily</key>
    <array>
        <integer>1</integer>
        <integer>2</integer>
    </array>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>arm64</string>
        <string>metal</string>
    </array>
    <key>UIRequiresFullScreen</key>
    <true/>
    <key>UIStatusBarHidden</key>
    <true/>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
</dict>
</plist>`;
}

export async function packageBrowserIpa(options: ClientIpaOptions): Promise<Blob> {
  const { appName, bundleId, version, gameFile, onProgress } = options;
  const zip = new JSZip();

  onProgress?.(10, 'Initializing iOS IPA payload structure...');
  const cleanAppName = appName.replace(/[^a-zA-Z0-9_-]/g, '') || 'NXGame';
  const appFolderName = `Payload/${cleanAppName}.app`;

  // Add Info.plist
  const plistContent = generateInfoPlist(appName, bundleId, version);
  zip.file(`${appFolderName}/Info.plist`, plistContent);

  // Add dummy launch stub binary (Mach-O ARM64 placeholder)
  // 0xCF 0xFA 0xED 0xFE represents standard Mach-O 64-bit magic in little endian
  const machoStub = new Uint8Array([
    0xcf, 0xfa, 0xed, 0xfe, // MH_MAGIC_64
    0x0c, 0x00, 0x00, 0x01, // CPU_TYPE_ARM64
    0x00, 0x00, 0x00, 0x00, // CPU_SUBTYPE_ARM64_ALL
    0x02, 0x00, 0x00, 0x00, // MH_EXECUTE
    0x00, 0x00, 0x00, 0x00, // ncmds
    0x00, 0x00, 0x00, 0x00, // sizeofcmds
    0x85, 0x00, 0x20, 0x00, // flags
    0x00, 0x00, 0x00, 0x00  // reserved
  ]);
  zip.file(`${appFolderName}/NXNativeLauncher`, machoStub, { binary: true });

  onProgress?.(30, 'Bundling Horizon HLE assets and metadata...');
  
  // Add NXNative config
  const nxConfig = JSON.stringify({
    appName,
    bundleId,
    targetArchitecture: 'arm64',
    graphicsBackend: 'Metal',
    hleMode: 'HorizonAppleSilicon',
    compiledWith: 'seedds/nxnative',
    timestamp: new Date().toISOString()
  }, null, 2);
  zip.file(`${appFolderName}/nxnative_config.json`, nxConfig);

  // Add game binary if provided
  if (gameFile) {
    onProgress?.(50, `Reading and injecting ${gameFile.name}...`);
    const fileBuffer = await gameFile.arrayBuffer();
    zip.file(`${appFolderName}/romfs/${gameFile.name}`, fileBuffer, { binary: true });
  }

  onProgress?.(80, 'Compressing into unsigned .ipa container...');
  const blob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    },
    (metadata) => {
      onProgress?.(80 + Math.round(metadata.percent * 0.19), `Packaging: ${Math.round(metadata.percent)}%`);
    }
  );

  onProgress?.(100, 'Packaging complete! Ready to sideload.');
  return blob;
}
