'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-background p-5 flex-col text-center">
          <Card className="border-drc-red/30 bg-drc-red/10 max-w-[500px]">
            <CardContent className="p-6">
              <h1 className="text-drc-red mb-3 text-lg font-bold">שגיאה</h1>
              <p className="text-foreground mb-3 text-sm">
                {this.state.error?.message || 'אירעה שגיאה לא צפויה'}
              </p>
              <details className="text-start mt-4">
                <summary className="cursor-pointer text-muted-foreground text-sm">
                  פרטים טכניים
                </summary>
                <pre className="bg-black/30 p-3 rounded-lg text-[11px] overflow-auto mt-3 text-muted-foreground">
                  {this.state.error?.stack}
                </pre>
              </details>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                רענן דף
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
