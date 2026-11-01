export interface WorkflowOptions {
  repoName: string;
  appName: string;
  bundleId: string;
  language: string;
  showFps: boolean;
  platform: 'ios-ipa' | 'mac-app';
  nxnativeBranch: string;
  runnerOs: 'macos-15' | 'macos-14';
}

export function generateNxnativeWorkflow(options: WorkflowOptions): string {
  const {
    appName,
    bundleId,
    language,
    showFps,
    platform,
    nxnativeBranch = 'main',
    runnerOs = 'macos-15',
  } = options;

  return `name: NXNative Cloud IPA Builder

on:
  workflow_dispatch:
    inputs:
      app_name:
        description: 'Application Display Name'
        required: false
        default: '${appName}'
      bundle_id:
        description: 'iOS Bundle Identifier'
        required: false
        default: '${bundleId}'
      language:
        description: 'Preferred in-game language (en, ja, fr, de, es, it, zh, ko)'
        required: false
        default: '${language}'
      show_fps:
        description: 'Show Performance HUD / FPS counter overlay'
        type: boolean
        default: ${showFps}
      platform:
        description: 'Target Output Package'
        type: choice
        options:
          - ios-ipa
          - mac-app
        default: '${platform}'

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: false

jobs:
  build-ipa:
    name: Build Native Apple Silicon IPA via NXNative
    runs-on: ${runnerOs} # Apple Silicon M-series runner
    timeout-minutes: 180

    steps:
      - name: System Hardware & macOS Info
        run: |
          echo "Architecture: $(uname -m)"
          echo "macOS Version: $(sw_vers -productVersion)"
          echo "Xcode Version: $(xcodebuild -version)"
          sysctl -n machdep.cpu.brand_string

      - name: Checkout NXNative Core
        uses: actions/checkout@v4
        with:
          repository: 'seedds/nxnative'
          ref: '${nxnativeBranch}'
          path: 'nxnative'

      - name: Cache Homebrew Packages
        id: cache-brew
        uses: actions/cache@v4
        with:
          path: |
            ~/Library/Caches/Homebrew
            /opt/homebrew/Cellar
          key: \${{ runner.os }}-brew-nxnative-v2
          restore-keys: |
            \${{ runner.os }}-brew-

      - name: Install macOS Toolchains & Dependencies
        run: |
          echo "::group::Installing Metal Toolchain"
          xcodebuild -downloadComponent MetalToolchain || true
          echo "::endgroup::"

          echo "::group::Installing Brew Dependencies"
          brew install xcodegen zstd glslang || true
          brew install --cask dotnet-sdk || true
          echo "::endgroup::"

      - name: Set up Native Python 3.12+
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'

      - name: Install NXNative Python Modules
        run: |
          python3 -m pip install --upgrade pip
          python3 -m pip install lz4 "capstone>=5,<6" fonttools nsz zbic "backports.zstd; python_version < '3.14'"

      - name: Restore or Prepare Keys
        env:
          PROD_KEYS_SECRET: \${{ secrets.PROD_KEYS }}
        run: |
          mkdir -p "$HOME/keys"
          if [ -n "$PROD_KEYS_SECRET" ]; then
            echo "$PROD_KEYS_SECRET" > "$HOME/keys/prod.keys"
            echo "Successfully loaded prod.keys from GitHub Secrets."
          elif [ -f "./keys/prod.keys" ]; then
            cp "./keys/prod.keys" "$HOME/keys/prod.keys"
            echo "Loaded prod.keys from repository ./keys directory."
          else
            echo "::error::No prod.keys found! Add your legally dumped prod.keys to GitHub Secrets (PROD_KEYS) or commit to ./keys/prod.keys."
            exit 1
          fi

      - name: Prepare Game Workspace
        run: |
          mkdir -p "$HOME/Games/Input"
          mkdir -p "$GITHUB_WORKSPACE/output"

          # Check if games are stored in repo directory
          if [ -d "./games" ] && [ "$(ls -A ./games 2>/dev/null)" ]; then
            echo "Found game files in ./games directory. Copying..."
            cp -r ./games/* "$HOME/Games/Input/"
          fi

          echo "Files in Input Directory:"
          ls -la "$HOME/Games/Input" || true

      - name: Execute NXNative Build Script
        working-directory: ./nxnative
        run: |
          ARGS=()
          
          if [ -n "\${{ inputs.app_name }}" ]; then
            ARGS+=("--app-name" "\${{ inputs.app_name }}")
          fi
          
          if [ -n "\${{ inputs.language }}" ]; then
            ARGS+=("--language" "\${{ inputs.language }}")
          fi
          
          if [ "\${{ inputs.show_fps }}" = "true" ]; then
            ARGS+=("--show-fps")
          fi

          if [ "\${{ inputs.platform }}" = "mac-app" ]; then
            ARGS+=("--platform" "mac-app")
          fi

          ARGS+=("-o" "$GITHUB_WORKSPACE/output")

          echo "Running: python3 scripts/build_ipa_from_nsp.py $HOME/Games/Input -k $HOME/keys/prod.keys \${ARGS[@]}"
          python3 scripts/build_ipa_from_nsp.py "$HOME/Games/Input" -k "$HOME/keys/prod.keys" "\${ARGS[@]}"

      - name: Verify Output Files
        run: |
          echo "Build Output Contents:"
          ls -lh "$GITHUB_WORKSPACE/output"

      - name: Upload Compiled IPA Artifact
        uses: actions/upload-artifact@v4
        with:
          name: \${{ inputs.app_name || 'NXNative-Game' }}-IPA
          path: output/*.ipa
          retention-days: 14
          if-no-files-found: error
`;
}
