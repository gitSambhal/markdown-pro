/**
 * Markdown Viewer Pro - Default Application & File Association Modal
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from './Modal';
import { DocumentTheme } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Monitor,
  Apple,
  Cpu,
  Sparkles,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import {
  isNativeNeutralino,
  registerDefaultAppForMarkdown,
  DefaultAppRegistrationResult
} from '../../services/neutralino';

interface DefaultAppModalProps {
  isOpen: boolean;
  theme: DocumentTheme;
  onClose: () => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export const DefaultAppModal: React.FC<DefaultAppModalProps> = ({
  isOpen,
  theme,
  onClose,
  onToast,
}) => {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [result, setResult] = useState<DefaultAppRegistrationResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<boolean>(false);

  if (!isOpen) return null;

  const osName =
    typeof window !== 'undefined' && (window as any).NL_OS
      ? (window as any).NL_OS
      : navigator.userAgent.includes('Mac')
      ? 'Darwin'
      : navigator.userAgent.includes('Win')
      ? 'Windows'
      : 'Linux';

  const handleRegisterDefault = async () => {
    setIsRegistering(true);
    try {
      const res = await registerDefaultAppForMarkdown();
      setResult(res);
      if (res.success) {
        onToast('success', 'Default Handler Configured', res.message);
      } else {
        onToast('info', 'File Association Guide', res.message);
      }
    } catch (err: any) {
      onToast('error', 'Registration Error', err?.message || 'Could not auto-register.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCopyInstructions = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(true);
    setTimeout(() => setCopiedIndex(false), 2000);
    onToast('success', 'Copied to Clipboard', 'Instructions copied to clipboard.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set as Default Application for .MD Files"
      maxWidth="lg"
    >
      <div className="space-y-6 text-sm">
        {/* Header Hero Banner */}
        <div
          className="p-4 sm:p-5 rounded-2xl border flex items-start gap-4"
          style={{
            backgroundColor: `${theme.accent}12`,
            borderColor: `${theme.accent}35`,
          }}
        >
          <div
            className="p-3 rounded-xl border shrink-0 text-white shadow-sm"
            style={{ backgroundColor: theme.accent }}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: theme.heading }}>
              <span>Seamless OS File Association</span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold"
                style={{
                  backgroundColor: theme.codeBg,
                  borderColor: theme.surfaceBorder,
                  color: theme.accent,
                }}
              >
                {osName === 'Darwin' ? 'macOS' : osName === 'Windows' ? 'Windows' : 'Linux'}
              </span>
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>
              Make <strong style={{ color: theme.heading }}>Markdown Viewer Pro</strong> the default reader when double-clicking any <code className="px-1 py-0.5 rounded border text-[11px] font-mono" style={{ backgroundColor: theme.codeBg, borderColor: theme.surfaceBorder }}>.md</code>, <code className="px-1 py-0.5 rounded border text-[11px] font-mono" style={{ backgroundColor: theme.codeBg, borderColor: theme.surfaceBorder }}>.markdown</code>, or <code className="px-1 py-0.5 rounded border text-[11px] font-mono" style={{ backgroundColor: theme.codeBg, borderColor: theme.surfaceBorder }}>.txt</code> file in your OS file manager.
            </p>
          </div>
        </div>

        {/* Action Button Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border" style={{ backgroundColor: `${theme.surface}90`, borderColor: theme.surfaceBorder }}>
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="font-semibold text-xs" style={{ color: theme.heading }}>1-Click Default Handler Setup</div>
            <p className="text-[11px]" style={{ color: theme.textMuted }}>Configures system registry & MIME handlers</p>
          </div>

          <button
            onClick={handleRegisterDefault}
            disabled={isRegistering}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: theme.accent }}
          >
            {isRegistering ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isRegistering ? 'Configuring System...' : 'Set as Default .MD Reader'}</span>
          </button>
        </div>

        {/* Registration Result Alert Banner */}
        {result && (
          <div
            className={`p-4 rounded-xl border space-y-2 text-xs ${
              result.success
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{result.message}</span>
            </div>
            {result.manualInstructions && (
              <p className="whitespace-pre-line leading-relaxed text-[11px] font-mono opacity-90 pl-6">
                {result.manualInstructions}
              </p>
            )}
          </div>
        )}

        {/* OS Specific Step-by-Step Instructions */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: theme.textMuted }}>
              <Terminal className="w-3.5 h-3.5" style={{ color: theme.accent }} />
              <span>OS-Specific File Association Guide</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Windows */}
            <div
              className={`p-3.5 rounded-xl border space-y-2 relative ${
                osName === 'Windows' ? 'ring-2 ring-indigo-500/50' : ''
              }`}
              style={{ backgroundColor: `${theme.surface}60`, borderColor: theme.surfaceBorder }}
            >
              <div className="flex items-center justify-between font-bold" style={{ color: theme.heading }}>
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-sky-400" />
                  <span>Windows</span>
                </div>
                {osName === 'Windows' && <span className="text-[10px] text-sky-400 font-mono">Current OS</span>}
              </div>
              <ol className="space-y-1.5 text-[11px] leading-relaxed list-decimal pl-4" style={{ color: theme.textMuted }}>
                <li>Right-click any <code className="font-mono">.md</code> file in File Explorer.</li>
                <li>Click <strong>Open with</strong> &rarr; <strong>Choose another app</strong>.</li>
                <li>Select <strong>Markdown Viewer Pro</strong>.</li>
                <li>Check <strong>"Always use this app to open .md files"</strong>.</li>
              </ol>
            </div>

            {/* macOS */}
            <div
              className={`p-3.5 rounded-xl border space-y-2 relative ${
                osName === 'Darwin' ? 'ring-2 ring-indigo-500/50' : ''
              }`}
              style={{ backgroundColor: `${theme.surface}60`, borderColor: theme.surfaceBorder }}
            >
              <div className="flex items-center justify-between font-bold" style={{ color: theme.heading }}>
                <div className="flex items-center gap-1.5">
                  <Apple className="w-4 h-4 text-slate-200" />
                  <span>macOS</span>
                </div>
                {osName === 'Darwin' && <span className="text-[10px] text-indigo-400 font-mono">Current OS</span>}
              </div>
              <ol className="space-y-1.5 text-[11px] leading-relaxed list-decimal pl-4" style={{ color: theme.textMuted }}>
                <li>Right-click any <code className="font-mono">.md</code> file in Finder.</li>
                <li>Click <strong>Get Info</strong> (<kbd className="font-mono">Cmd+I</kbd>).</li>
                <li>Expand <strong>Open with:</strong> and select <strong>Markdown Viewer Pro</strong>.</li>
                <li>Click <strong>Change All...</strong> and confirm.</li>
              </ol>
            </div>

            {/* Linux */}
            <div
              className={`p-3.5 rounded-xl border space-y-2 relative ${
                osName === 'Linux' ? 'ring-2 ring-indigo-500/50' : ''
              }`}
              style={{ backgroundColor: `${theme.surface}60`, borderColor: theme.surfaceBorder }}
            >
              <div className="flex items-center justify-between font-bold" style={{ color: theme.heading }}>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Linux</span>
                </div>
                {osName === 'Linux' && <span className="text-[10px] text-emerald-400 font-mono">Current OS</span>}
              </div>
              <ol className="space-y-1.5 text-[11px] leading-relaxed list-decimal pl-4" style={{ color: theme.textMuted }}>
                <li>Right-click any <code className="font-mono">.md</code> file in File Manager.</li>
                <li>Click <strong>Properties</strong> &rarr; <strong>Open With</strong>.</li>
                <li>Select <strong>Markdown Viewer Pro</strong>.</li>
                <li>Click <strong>Set as Default</strong>.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: theme.surfaceBorder }}>
          <div className="text-[11px] flex items-center gap-1.5" style={{ color: theme.textMuted }}>
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Association applies immediately to all .md & .markdown documents.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer hover:opacity-80"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
              color: theme.text,
            }}
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
