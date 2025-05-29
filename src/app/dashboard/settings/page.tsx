// next
import { revalidatePath } from 'next/cache';

// components
import { SubmitButton } from '../../components/SubmitButtons';

// shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// prisma
import prisma from '../../../../lib/db';

// kinde
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

async function getData(userId: string) {
  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
      colorScheme: true,
      isPublic: true,
      program: true,
    },
  });

  return data;
}

export default async function SettingPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData(user?.id as string);

  async function postData(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;
    const colorScheme = formData.get('color') as string;
    const isPublic = formData.get('isPublic'); // Don't assume 'on' or 'off' yet
    const program = formData.get('program') as string;

    const data: any = {
      name: name ?? undefined,
      colorScheme: colorScheme ?? undefined,
      program: program ?? undefined,
    };

    // Only update isPublic if the switch was turned on or off
    if (isPublic !== null) {
      data.isPublic = isPublic === 'on';
    }

    await prisma.user.update({
      where: {
        id: user?.id,
      },
      data: data,
    });

    revalidatePath('/', 'layout');
  }

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Hem</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Inställningar</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid items-start gap-8">
        <div className="flex items-center justify-between px-2">
          <div className="grid gap-1">
            <h1>Inställningar</h1>
            <p className="text-muted-foreground">Dina profilinställningar</p>
          </div>
        </div>

        <Card>
          <form action={postData} className="flex flex-col gap-4">
            <CardHeader>
              <CardTitle>Allmänna uppgifter</CardTitle>
              <CardDescription>
                Vänligan fyll i dina uppgifter och glöm inte att spara.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label>Namn</Label>
                  <Input
                    name="name"
                    type="text"
                    id="nama"
                    placeholder="Your name"
                    defaultValue={data?.name ?? undefined}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    name="email"
                    type="text"
                    id="email"
                    placeholder="Your Email"
                    disabled
                    defaultValue={data?.email as string}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Program</Label>
                  <Select name="program" defaultValue={data?.program ?? ''}>
                    <SelectTrigger className="w-fill">
                      <SelectValue placeholder="Välj program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Program</SelectLabel>
                        <SelectItem value="Datateknik">Datateknik</SelectItem>
                        <SelectItem value="Design och produktutveckling">
                          Design och produktutveckling
                        </SelectItem>
                        <SelectItem value="Elektronikdesign">
                          Elektronikdesign
                        </SelectItem>
                        <SelectItem value="Energi- miljö- managment">
                          Energi- miljö- managment
                        </SelectItem>
                        <SelectItem value="Industriell ekonomi">
                          Industriell ekonomi
                        </SelectItem>
                        <SelectItem value="Informationsteknologi">
                          Informationsteknologi
                        </SelectItem>
                        <SelectItem value="Kemisk biologi">
                          Kemisk biologi
                        </SelectItem>
                        <SelectItem value="Kommunikation, transport och samhälle">
                          Kommunikation, transport och samhälle
                        </SelectItem>
                        <SelectItem value="Medicinsk teknik">
                          Medicinsk teknik
                        </SelectItem>
                        <SelectItem value="Medieteknik">Medieteknik</SelectItem>
                        <SelectItem value="Mjukvaruteknik">
                          Mjukvaruteknik
                        </SelectItem>
                        <SelectItem value="Maskinteknik">
                          Maskinteknik
                        </SelectItem>
                        <SelectItem value="Teknisk biologi">
                          Teknisk biologi
                        </SelectItem>
                        <SelectItem value="Teknisk fysik och elektroteknik">
                          Teknisk fysik och elektroteknik
                        </SelectItem>
                        <SelectItem value="Industriell ekonomi - internationell">
                          Industriell ekonomi - internationell
                        </SelectItem>
                        <SelectItem value="Teknisk fysik och elektroteknik - internationell">
                          Teknisk fysik och elektroteknik - internationell
                        </SelectItem>
                        <SelectItem value="Teknisk matematik">
                          Teknisk matematik
                        </SelectItem>
                        <SelectItem value="Datadriven utveckling">
                          Datadriven utveckling
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Färgschema</Label>
                  <Select name="color" defaultValue={data?.colorScheme}>
                    <SelectTrigger className="w-fill">
                      <SelectValue placeholder="Select a Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Färg</SelectLabel>
                        <SelectItem value="theme-green">Grön</SelectItem>
                        <SelectItem value="theme-blue">Blå</SelectItem>
                        <SelectItem value="theme-violet">Lila</SelectItem>
                        <SelectItem value="theme-yellow">Gul</SelectItem>
                        <SelectItem value="theme-orange">Orange</SelectItem>
                        <SelectItem value="theme-red">Röd</SelectItem>
                        <SelectItem value="theme-rose">Rosa</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 space-y-1">
                  <Label htmlFor="isPublic">Gör schemat publikt</Label>
                  <Switch
                    defaultChecked={data?.isPublic ?? true}
                    id="isPublic"
                    name="isPublic"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
