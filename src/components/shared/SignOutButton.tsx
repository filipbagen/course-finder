import { signOut } from '@/app/actions/auth';

export function SignOutButton() {
  return (
    <form action={signOut} className="w-full">
      <button
        type="submit"
        className="w-full text-left text-sm hover:bg-accent hover:text-accent-foreground p-0 bg-transparent border-none cursor-pointer"
      >
        Sign Out
      </button>
    </form>
  );
}