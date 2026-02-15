'use client'

import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'

interface DeleteImageButtonProps {
  onDelete: () => Promise<void>
}

export function DeleteImageButton({ onDelete }: DeleteImageButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await onDelete()
        toast.success('Profilbild borttagen', {
          description: 'Din profilbild har tagits bort.',
        })
      } catch {
        toast.error('Fel vid borttagning', {
          description: 'Kunde inte ta bort profilbilden. Försök igen.',
        })
      }
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      <X className="mr-1 h-4 w-4" />
      {isPending ? 'Tar bort...' : 'Ta bort'}
    </Button>
  )
}
