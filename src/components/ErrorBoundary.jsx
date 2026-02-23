import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorCount = (this.state.errorCount || 0) + 1;
    
    this.setState({
      error,
      errorInfo,
      errorCount
    });

    console.error('Error caught by boundary:', error, errorInfo);
    
    if (errorCount <= 3) {
      fetch('/api/logError', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.toString(),
          stack: error.stack,
          timestamp: new Date().toISOString(),
          url: window.location.href
        })
      }).catch(() => {});
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
              <p className="text-gray-600">We encountered an unexpected error. Our team has been notified.</p>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={this.handleReset}
                className="w-full bg-[#1a9c5b] hover:bg-[#158a4e] text-white"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/contact'}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;