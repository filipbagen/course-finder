'use client'

import { ReactNode, useTransition } from 'react'
import { toast } from 'sonner'

interface SettingsFormProps {
  children: ReactNode
  action: (formData: FormData) => Promise<void>
}

export function SettingsForm({ children, action }: SettingsFormProps) {
  const [_isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const pictureFile = formData.get('picture') as File
        const newPassword = formData.get('new_password') as string
        const hasImageUpload = pictureFile && pictureFile.size > 0
        const hasPasswordChange = newPassword && newPassword.trim()

        await action(formData)

        if (hasPasswordChange && hasImageUpload) {
          toast.success('Allt uppdaterat!', {
            description:
              'Lösenord ändrat, profilbild uppladdad och inställningar sparade.',
          })
        } else if (hasPasswordChange) {
          toast.success('Lösenord ändrat', {
            description:
              'Ditt lösenord har ändrats och inställningarna sparade.',
          })
        } else if (hasImageUpload) {
          toast.success('Profilbild uppladdad', {
            description:
              'Din nya profilbild har laddats upp och inställningarna sparade.',
          })
        } else {
          toast.success('Inställningar sparade', {
            description: 'Dina inställningar har uppdaterats.',
          })
        }
      } catch (error) {
        console.error('Settings form error:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Okänt fel'
        toast.error('Fel vid sparande', {
          description: errorMessage,
        })
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {children}
    </form>
  )
}
