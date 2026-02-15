import React from 'react'
import { Separator } from '@/components/ui/separator'

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto flex w-full flex-col items-center justify-center py-8">
      <Separator className="mb-4" />
      <p className="text-sm text-slate-400">
        Designad och utvecklad av{' '}
        <a
          href="https://filipbagen.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <u>
            <b>mig</b>
          </u>
        </a>
      </p>
    </footer>
  )
}

export default Footer
