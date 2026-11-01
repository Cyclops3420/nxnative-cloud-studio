import React, { useState } from 'react';
import { FileCode, Copy, Check, Download, Layers } from 'lucide-react';
import { generateNxnativeWorkflow } from '@/lib/workflow-generator';
import { BuildConfig } from './BuildConfiguration';

interface WorkflowTemplateViewerProps {
  config: BuildConfig;
}

export const WorkflowTemplateViewer: React.FC<WorkflowTemplateViewerProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  const workflowYml = generateNxnativeWorkflow({
    repoName: 'my-nxnative-builds',
    appName: config.appName || 'Super Mario Wonder',
    bundleId: config.bundleId || 'com.nxnative.mariowonder',
    language: config.language || 'en',
    showFps: config.showFps,
    platform: config.platform,
    nxnativeBranch: 'main',
    runnerOs: 'macos-15',
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(workflowYml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([workflowYml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nxnative-builder.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#141724] border border-gray-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">
              GitHub Actions Workflow Specification
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Commit this file to <code className="text-emerald-300 font-mono">.github/workflows/nxnative-builder.yml</code> in your repository.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .yml</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Workflow YML'}</span>
          </button>
        </div>
      </div>

      <div className="relative rounded-xl bg-black/60 border border-gray-800 p-4 font-mono text-xs text-gray-300 max-h-96 overflow-y-auto">
        <pre className="leading-relaxed">{workflowYml}</pre>
      </div>
    </div>
  );
};
