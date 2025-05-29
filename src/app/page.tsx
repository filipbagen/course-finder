import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// icons
import {
  MapPin,
  Star,
  Search,
  Sparkles,
  LineChart,
  ArrowDownWideNarrow,
  Handshake,
} from 'lucide-react';

// data
import db from '@/lib/courses.json';

export default async function Home() {
  const supabase = await createClient();

  // Use getUser() instead of getSession() for server components
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Redirect authenticated users to the private page
  if (user && !error) {
    redirect('/private');
  }

  return (
    <div className="pt-10 sm:pt-22 pb-10 sm:pb-20 flex flex-col items-center gap-8 justify-center text-center">
      <div className="flex flex-col gap-4 items-center">
        <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
          <p className="text-sm font-semibold text-gray-700">
            Skapa ett konto idag!
          </p>
        </div>

        <h1 className="max-w-3xl text-4xl font-bold md:text-6xl lg:text-6xl">
          Hitta de bästa{' '}
          <span className="bg-gradient-to-r from-primary to-blue-400 inline-block text-transparent bg-clip-text">
            masterkurserna
          </span>{' '}
          snabbt och enkelt!
        </h1>

        <p className="mt-5 max-w-prose text-zinc-700 dark:text-white sm:text-lg">
          Hitta enkelt bland LiUs alla masterkurser och hitta den kurs som
          passar dig bäst. Sök bland kurser, filtrera och jämför för att hitta
          den bästa mastern för dig. Börja idag!
        </p>

        <Link href="/signup">
          <Button className="w-min">Skapa konto</Button>
        </Link>
      </div>

      {/* gradient */}
      <div>
        <div className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-11ren)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm-left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>
          <div className="mx-auto max-w-6xl px-6 lg:px-8 sm:mt-24">
            <div className="mt-16 flow-root sm:mt-24">
              <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <Image
                  src="/assets/dashboard-preview-dark.jpg"
                  alt="product preview"
                  width={2368}
                  height={1452}
                  className="rounded-md bg-muted-foreground/10 p-2 sm:p-8 md:p-2 shadow-2xl ring-1 ring-gray-900/10 hidden dark:block"
                />
                <Image
                  src="/assets/dashboard-preview-light.jpg"
                  alt="product preview"
                  width={2368}
                  height={1452}
                  className="rounded-md bg-background p-2 sm:p-8 md:p-2 shadow-2xl ring-1 ring-gray-900/10 block dark:hidden"
                />
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-13ren)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm-left-[calc(50%-36rem)] sm:w-[72.1875rem]"
            />
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="my-6 px-6 lg:my-24 lg:px-8 ">
        <div className="mx-auto max-w-4xl sm:text-center">
          <h2 className="mt-10 font-bold text-4xl text-gray-900 dark:text-white sm:text-5xl">
            Välj masterkurser på några minuter
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-white">
            Course Finder innehåller alla masterkurser som erbjuds vid
            Linköpings universitet. Hitta enkelt och snabbt den kurs som passar
            dig bäst.
          </p>
        </div>
      </div>

      {/* Course carousell */}
      <div className="relative text-left my-10 overflow-hidden hidden lg:block md:block">
        <div className="pointer-events-none absolute -top-1 z-10 h-20 w-full bg-gradient-to-b from-white to-transparent dark:from-background"></div>
        <div className="pointer-events-none absolute -bottom-1 z-10 h-20 w-full bg-gradient-to-t from-white to-transparent dark:from-background"></div>
        <div className="pointer-events-none absolute -left-1 z-10 h-full w-20 bg-gradient-to-r from-white to-transparent dark:from-background"></div>
        <div className="pointer-events-none absolute -right-1 z-10 h-full w-20 bg-gradient-to-l from-white to-transparent dark:from-background"></div>

        <div className="grid skewAnimation grid-cols-1 gap-7 sm:h-[500px] sm:grid-cols-2">
          {db.Courses.map((course: any) => (
            <Card
              key={course.code}
              className="
                flex-grow h-min bg-white rounded-md border border-gray-100
                px-5 py-3 shadow-md transition-all hover:translate-x-1 hover:-translate-y-1
                hover:scale-[1.025] hover:shadow-xl p-8"
            >
              <CardHeader>
                <div className="flex justify-between gap-2 items-start">
                  <CardTitle>{course.name}</CardTitle>
                  <Button size={'icon'} className="hover:cursor-default">
                    +
                  </Button>
                </div>
                <CardDescription>{course.code}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex gap-2 items-center mb-4">
                  <MapPin size={16} />
                  <p>{course.campus}</p>
                </div>

                <div className="flex justify-between">
                  <CardFooter className="flex gap-4">
                    <p>Termin {course.semester}</p>
                    <p>Period {course.period}</p>
                    <p>Block {course.block}</p>
                  </CardFooter>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Steps */}
      <ol className="my-6 lg:my-24 space-y-4 md:flex md:space-x-12 md:space-y-0">
        <li className="md:flex-1">
          <div className="flex flex-col space-y-2 py-2 pl-4 md:pb-0 md:pl-0 md:pt-4">
            <span className="text-sm font-medium text-blue-600">Steg 1</span>
            <span className="text-xl font-semibold">Skapa ett konto</span>
            <span className="mt-2 text-zink-700">
              Course Finder är helt gratis att använda. Skapa ett konto för att
              komma igång.
            </span>
          </div>
        </li>
        <li className="md:flex-1">
          <div className="flex flex-col space-y-2 py-2 pl-4 md:pb-0 md:pl-0 md:pt-4">
            <span className="text-sm font-medium text-blue-600">Steg 2</span>
            <span className="text-xl font-semibold">Välj masterkurser</span>
            <span className="mt-2 text-zink-700">
              Lägg enkelt till en kurs till ditt schema och jämför dina kurser
              med dina vänners.
            </span>
          </div>
        </li>
        <li className="md:flex-1">
          <div className="flex flex-col space-y-2 py-2 pl-4 md:pb-0 md:pl-0 md:pt-4">
            <span className="text-sm font-medium text-blue-600">Steg 3</span>
            <span className="text-xl font-semibold">Klart!</span>
            <span className="mt-2 text-zink-700">
              Att skapa, dela och jämföra dina masterkurser har aldrig varit
              enklare.
            </span>
          </div>
        </li>
      </ol>

      {/* Bottom image */}
      <div>
        <div className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-11ren)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm-left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>
          <div className="mx-auto max-w-6xl px-6 lg:px-8 sm:mt-24">
            <div className="mt-16 flow-root sm:mt-24">
              <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <Image
                  src="/assets/schedule-dark.jpg"
                  alt="Schedule view"
                  width={2368}
                  height={1452}
                  className="rounded-md bg-muted-foreground/10 p-2 sm:p-8 md:p-2 shadow-2xl ring-1 ring-gray-900/10 hidden dark:block"
                />
                <Image
                  src="/assets/schedule-light.jpg"
                  alt="Schedule view"
                  width={2368}
                  height={1452}
                  className="rounded-md bg-white p-2 sm:p-8 md:p-2 shadow-2xl ring-1 ring-gray-900/10 block dark:hidden"
                />
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-13rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
            />
          </div>
        </div>
      </div>

      <div className="my-6 lg:my-24 flex flex-col gap-16 px-6 lg:px-8 mx-auto max-w-4xl">
        <h2 className="mt-10 font-bold text-4xl text-gray-900 dark:text-white sm:text-5xl">
          Funktioner
        </h2>

        <div className="grid grid-cols-2 gap-12 text-start">
          <div className="flex flex-col gap-4">
            <Search />
            <h5 className="text-primary">Sök</h5>
            <span>
              Hitta enkelt den kurs du letar efter geneom att sök efter kurser
              baserat på kursnamn och kurskod.
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <ArrowDownWideNarrow />
            <h5 className="text-primary">Filter</h5>
            <span>
              Filtrera enkelt kurser baserat på bland annat termin, studietakt,
              huvudområde och examinationsmoment.
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <LineChart />
            <h5 className="text-primary">Statistik</h5>
            <span>
              Se exakt hur många högskolepoäng du har läst och hur många du
              behöver för att nå din examen.
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <Handshake />
            <h5 className="text-primary">Samarbete</h5>
            <span>
              Dela dina kurser med dina vänner och se vilka kurser ni har
              gemensamt. Hjälp varandra att hitta de bästa kurserna.
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <Star />
            <h5 className="text-primary">Recension</h5>
            <span>
              Se recensioner på kurser och lämna rekommendationer på en kurs och
              hjälp andra studenter att hitta rätt.
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <Sparkles />
            <h5 className="text-primary">AI-rekommendationer (kommer snart)</h5>
            <span>
              Få rekommendationer på kurser som passar dina intressen och
              tidigare valda kurser. Hitta nya spännande kurser att läsa.
            </span>
          </div>
        </div>
      </div>

      <div className="my-8 lg:my-12 px-6 lg:px-8 mx-auto max-w-4xl">
        <h2 className="mt-10 font-bold text-4xl text-gray-900 dark:text-white sm:text-5xl">
          Kom igång
        </h2>

        <p>Vad väntar du på? Skapa ett konto och börja idag!</p>

        <Link href="/signup" className="mt-4 inline-block">
          <Button>Skapa konto</Button>
        </Link>
      </div>
    </div>
  );
}


// OLD CODE BELOW





// export default async function Home() {
//   const supabase = createClientComponentClient();
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   // redirect the user to the /private page if they are logged in
//   console.log('supabase', supabase);
//   if (session) {
//     redirect('/private');
//   }

  
// }
