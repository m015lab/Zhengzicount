import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service here
    console.error("ZhengCounter caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReport = () => {
    const { error, errorInfo } = this.state;
    const recipient = "tuandaokeji@outlook.com";
    const subject = "正字计数应用错误报告 (Zheng Counter Error Report)";
    
    let body = `Hi Developer,\n\nI encountered an error in the Zheng Counter app.\n\n`;
    body += `--- Error Details ---\n`;
    if (error) {
        body += `Message: ${error.toString()}\n\n`;
    }
    if (errorInfo) {
        body += `Component Stack:\n${errorInfo.componentStack}\n\n`;
    }
    body += `User Agent: ${navigator.userAgent}\n`;
    body += `Time: ${new Date().toISOString()}`;

    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-stone-950 p-6 text-center font-sans">
          <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 dark:border-stone-800">
             <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-stone-100 mb-2">出错了</h2>
            <p className="text-gray-600 dark:text-stone-400 mb-8 text-sm leading-relaxed">
              应用遇到了意外错误。我们建议您发送错误报告以帮助我们修复此问题。
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReport}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-stone-900"
              >
                发送错误报告
              </button>
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 bg-gray-100 dark:bg-stone-800 hover:bg-gray-200 dark:hover:bg-stone-700 text-gray-900 dark:text-stone-200 rounded-xl font-medium transition-colors focus:outline-none"
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;