import { signOut } from '@/app/actions/auth';

export function SignOutButton() {
  return (
    <form action={signOut} className="w-full">
      <button
        type="submit"
        className="w-full text-left text-sm p-0 bg-transparent border-none cursor-pointer"
      >
        Logga ut
      </button>
    </form>
  );
}
