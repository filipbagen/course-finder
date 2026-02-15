import { signOut } from '@/app/actions/auth'

export function SignOutButton() {
  return (
    <form action={signOut} className="w-full">
      <button
        type="submit"
        className="w-full cursor-pointer border-none bg-transparent p-0 text-left text-sm"
      >
        Logga ut
      </button>
    </form>
  )
}
