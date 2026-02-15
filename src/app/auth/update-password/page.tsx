export const dynamic = 'force-dynamic'

import { UpdatePasswordForm } from './UpdatePasswordForm'

export default function Page() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm />
      </div>
    </div>
  )
}
