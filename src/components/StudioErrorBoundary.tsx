import React from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { resetStudioStorage } from '../utils/studioStorage';

interface StudioErrorBoundaryProps {
  children: React.ReactNode;
  onResetSettings?: () => void;
}

interface StudioErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
  recoveryKey: number;
}

export class StudioErrorBoundary extends React.Component<
  StudioErrorBoundaryProps,
  StudioErrorBoundaryState
> {
  constructor(props: StudioErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: null,
      recoveryKey: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<StudioErrorBoundaryState> {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Log silently to the browser console for debugging without leaking stack traces to the UI
    console.error('StudioErrorBoundary caught an error:', error, info.componentStack);
  }

  private handleReloadStage = () => {
    this.setState((prev) => ({
      hasError: false,
      errorMessage: null,
      recoveryKey: prev.recoveryKey + 1,
    }));
  };

  private handleResetSettings = () => {
    resetStudioStorage();
    this.props.onResetSettings?.();
    this.setState((prev) => ({
      hasError: false,
      errorMessage: null,
      recoveryKey: prev.recoveryKey + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-dvh w-full bg-[#0b0b0d] text-neutral-100 flex items-center justify-center p-6"
        >
          <div className="w-full max-w-md rounded-[28px] border border-white/12 bg-[#16161a] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.65)] space-y-5">
            <div className="flex items-start gap-3.5">
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-amber-500/14 text-amber-400 shrink-0"
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
              </span>
              <div className="space-y-1 min-w-0">
                <h1 className="text-base font-semibold tracking-tight text-white">
                  Showcase stage hit an unexpected error
                </h1>
                <p className="text-xs leading-relaxed text-neutral-400">
                  Reload the stage to try rendering again, or reset saved studio preferences back to
                  defaults.
                </p>
              </div>
            </div>

            {this.state.errorMessage && (
              <p className="rounded-xl bg-white/[0.04] border border-white/8 px-3.5 py-2.5 text-[11px] font-mono-tabular text-neutral-300 break-words">
                {this.state.errorMessage}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={this.handleReloadStage}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] h-11 px-5 rounded-full bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-semibold tracking-tight transition-colors studio-focus-ring"
              >
                <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Reload Stage</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetSettings}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] h-11 px-5 rounded-full bg-white/[0.08] text-neutral-100 hover:bg-white/[0.14] border border-white/12 text-xs font-semibold tracking-tight transition-colors studio-focus-ring"
              >
                <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Reset Settings</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <React.Fragment key={this.state.recoveryKey}>{this.props.children}</React.Fragment>;
  }
}
