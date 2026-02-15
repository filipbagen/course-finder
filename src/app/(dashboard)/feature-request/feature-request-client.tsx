'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Lightbulb } from 'lucide-react'

// This is now a client component that gets wrapped by the server page component
export default function FeatureRequestClient() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [featureType, setFeatureType] = useState('')
  const [featureRequest, setFeatureRequest] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feature-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          featureType,
          featureRequest,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        toast.success('Din förfrågan har skickats', {
          description: 'Tack för ditt bidrag till att förbättra Course Finder!',
        })
        // Reset form
        setName('')
        setEmail('')
        setFeatureType('')
        setFeatureRequest('')
      } else {
        toast.error('Något gick fel', {
          description: 'Försök igen senare eller kontakta support.',
        })
      }
    } catch (error) {
      console.error('Error submitting feature request:', error)
      toast.error('Något gick fel', {
        description: 'Försök igen senare eller kontakta support.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8 flex items-center gap-4">
        <Lightbulb className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Föreslå en funktion</h1>
          <p className="text-muted-foreground">
            Hjälp oss att förbättra Course Finder genom att dela dina idéer
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Din feedback är värdefull</CardTitle>
          <CardDescription>
            Har du en idé om hur vi kan förbättra användarupplevelsen? Dela den
            med oss!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-300">
                  Tack för din feedback!
                </h3>
                <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                  Vi har tagit emot din förfrågan och kommer att granska den
                  inom kort. Din input hjälper oss att göra Course Finder bättre
                  för alla användare.
                </p>
              </div>
              <Button onClick={() => setSubmitted(false)}>
                Skicka en till förfrågan
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Namn</Label>
                  <Textarea
                    id="name"
                    placeholder="Ditt namn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <Textarea
                    id="email"
                    placeholder="Din e-postadress"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feature-type">Typ av förfrågan</Label>
                <Select
                  value={featureType}
                  onValueChange={setFeatureType}
                  required
                >
                  <SelectTrigger id="feature-type">
                    <SelectValue placeholder="Välj typ av förfrågan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enhancement">
                      Förbättring av existerande funktion
                    </SelectItem>
                    <SelectItem value="new-feature">Ny funktion</SelectItem>
                    <SelectItem value="bug-report">Buggrapport</SelectItem>
                    <SelectItem value="other">Annat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request">Din förfrågan</Label>
                <Textarea
                  id="request"
                  placeholder="Beskriv din förfrågan i detalj..."
                  value={featureRequest}
                  onChange={(e) => setFeatureRequest(e.target.value)}
                  required
                  className="min-h-32"
                />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Skickar...' : 'Skicka förfrågan'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
