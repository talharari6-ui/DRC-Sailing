'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sailboat } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading, error } = useAuth()
  const [loginCode, setLoginCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/schedule')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    setIsSubmitting(true)

    try {
      await login(loginCode)
      router.push('/schedule')
    } catch (err) {
      setLocalError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-drc-bg via-drc-bg2 to-drc-bg3 p-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Sailboat size={48} className="mx-auto mb-3 text-drc-blue-light" />
          <h1 className="text-2xl font-extrabold text-drc-blue-light mb-2">
            חוג שייט
          </h1>
          <p className="text-sm text-muted-foreground">מרכז דניאל</p>
        </div>

        {/* Login Form */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground font-semibold mb-2 block">
                  קוד כניסה
                </Label>
                <Input
                  type="text"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  placeholder="הזן את קוד הכניסה שלך"
                  disabled={isSubmitting || isLoading}
                  className="bg-black/35 border-border text-foreground text-base"
                />
              </div>

              {/* Error */}
              {(localError || error) ? (
                <Alert variant="destructive">
                  <AlertDescription>{localError || error}</AlertDescription>
                </Alert>
              ) : null}

              {/* Submit */}
              <Button
                type="submit"
                disabled={!loginCode || isSubmitting || isLoading}
                className="w-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 text-base rounded-xl"
              >
                {isSubmitting || isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ממתין...
                  </span>
                ) : (
                  'כניסה'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          גרסה 2.0 • מבוססת Next.js
        </p>
      </div>
    </div>
  )
}
