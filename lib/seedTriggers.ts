import postgres from "postgres";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("Couldn't find db url");
}
const sql = postgres(dbUrl);

async function main() {
  await sql`
     create or replace function public.handle_new_user()
     returns trigger as $$
     begin
         insert into public."User" (id, email)
         values (new.id, new.email);
         return new;
     end;
     $$ language plpgsql security definer;
     `;
  await sql`
     create or replace trigger on_auth_user_created
         after insert on auth.users
         for each row execute procedure public.handle_new_user();
   `;

  await sql`
     create or replace function public.handle_user_delete()
     returns trigger as $$
     begin
       delete from auth.users where id = old.id;
       return old;
     end;
     $$ language plpgsql security definer;
   `;

  await sql`
     create or replace trigger on_user_deleted
       after delete on public."User"
       for each row execute procedure public.handle_user_delete()
   `;

  console.log(
    "Finished adding triggers and functions for User handling."
  );
  process.exit();
}

main();