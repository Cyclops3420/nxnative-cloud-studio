import React, { useRef, useState } from 'react';
import { UploadCloud, FileCode2, Trash2, CheckCircle, Info, Sparkles, Layers } from 'lucide-react';
import { parseSwitchFileHeader, SwitchFileMetadata } from '@/lib/switch-parser';

interface GameUploaderProps {
  files: { file: File; meta: SwitchFileMetadata }[];
  onAddFiles: (newFiles: { file: File; meta: SwitchFileMetadata }[]) => void;
  onRemoveFile: (index: number) => void;
  onSelectPrimaryName?: (name: string, titleId?: string) => void;
}

export const GameUploader: React.FC<GameUploaderProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  onSelectPrimaryName,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | File[]) => {
    setIsProcessing(true);
    const parsedList: { file: File; meta: SwitchFileMetadata }[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const meta = await parseSwitchFileHeader(file);
        parsedList.push({ file, meta });
      } catch (err) {
        console.error('Failed to parse file:', file.name, err);
      }
    }

    if (parsedList.length > 0) {
      onAddFiles(parsedList);

      // Auto-suggest app name from first base game or homebrew
      const primary = parsedList.find((f) => f.meta.category === 'Base Game' || f.meta.category === 'Homebrew App') || parsedList[0];
      if (primary && onSelectPrimaryName && primary.meta.suggestedName) {
        onSelectPrimaryName(primary.meta.suggestedName, primary.meta.detectedTitleId);
      }
    }
    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Demo loader for quick testing
  const loadDemoFile = () => {
    // Create a mock homebrew/NSP file blob for testing
    const header = new Uint8Array(4096);
    // Write 'PFS0' magic
    header[0] = 0x50; header[1] = 0x46; header[2] = 0x53; header[3] = 0x30;
    // num files = 1
    header[4] = 0x01;
    // string table size = 16
    header[8] = 0x10;

    const dummyBlob = new Blob([header, new Uint8Array(2048)], { type: 'application/octet-stream' });
    const demoFile = new File(
      [dummyBlob],
      'Super Mario Wonder [010015100B514000][v0].nsp',
      { type: 'application/octet-stream' }
    );
    handleFiles([demoFile]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-500" />
            Switch Game Backups (.nsp, .nsz, .xci, .nro)
          </h3>
          <p className="text-xs text-gray-400">
            Select your legally extracted base game, updates, or homebrew executables.
          </p>
        </div>

        {files.length === 0 && (
          <button
            type="button"
            onClick={loadDemoFile}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Load Sample NSP
          </button>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-red-500 bg-red-950/20 shadow-lg glow-switch-red'
            : 'border-gray-700/80 hover:border-gray-600 bg-[#12151f]/60 hover:bg-[#141824]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".nsp,.nsz,.xci,.xcz,.nro"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(Array.from(e.target.files));
          }}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
            <UploadCloud className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {isProcessing ? 'Analyzing Game File Headers...' : 'Click to select or drag & drop Switch games'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports .nsp (eShop/Base), .xci (Cartridge), .nsz (Compressed), and .nro (Homebrew)
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 font-mono">PFS0 / NSP</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-mono">HFS0 / XCI</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-mono">NRO0 / Homebrew</span>
          </div>
        </div>
      </div>

      {/* Uploaded File Cards */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Detected Files ({files.length}):
          </p>
          
          <div className="grid grid-cols-1 gap-2.5">
            {files.map(({ file, meta }, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#161a26] border border-gray-800 hover:border-gray-700 transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    meta.category === 'Base Game' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                    meta.category === 'Update' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                    meta.category === 'DLC' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  }`}>
                    <FileCode2 className="w-5 h-5" />
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate max-w-[280px] sm:max-w-md">
                        {meta.suggestedName || file.name}
                      </p>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                        meta.category === 'Base Game' ? 'bg-red-500/20 text-red-300' :
                        meta.category === 'Update' ? 'bg-amber-500/20 text-amber-300' :
                        meta.category === 'DLC' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {meta.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{meta.formattedSize}</span>
                      {meta.detectedTitleId && (
                        <span className="font-mono text-gray-300 bg-gray-900/80 px-1.5 py-0.5 rounded border border-gray-800">
                          ID: {meta.detectedTitleId}
                        </span>
                      )}
                      {meta.detectedVersion && (
                        <span className="text-gray-400">{meta.detectedVersion}</span>
                      )}
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle className="w-3 h-3" />
                        {meta.magicDetected}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveFile(idx)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
