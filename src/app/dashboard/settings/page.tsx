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
import prisma from '../../lib/db';

// kinde
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

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
    const isPublic = formData.get('isPublic') === 'on'; // Assumes checkbox sending 'on' when checked

    await prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        name: name ?? undefined,
        colorScheme: colorScheme ?? undefined,
        isPublic: isPublic, // Updating the isPublic status
      },
    });

    revalidatePath('/', 'layout');
  }

  return (
    <div className="grid items-start gap-8">
      <div className="flex items-center justify-between px-2">
        <div className="grid gap-1">
          <h1>Settings</h1>
          <p className="text-muted-foreground">Your profile settings</p>
        </div>
      </div>

      <Card>
        <form action={postData} className="flex flex-col gap-4">
          <CardHeader>
            <CardTitle>General Data</CardTitle>
            <CardDescription>
              Please provide general information about yourself and don't forget
              to save
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label>Your Name</Label>
                <Input
                  name="name"
                  type="text"
                  id="nama"
                  placeholder="Your name"
                  defaultValue={data?.name ?? undefined}
                />
              </div>

              <div className="space-y-1">
                <Label>Your email</Label>
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
                <Label>Color Scheme</Label>
                <Select name="color" defaultValue={data?.colorScheme}>
                  <SelectTrigger className="w-fill">
                    <SelectValue placeholder="Select a Color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Color</SelectLabel>
                      <SelectItem value="theme-green">Green</SelectItem>
                      <SelectItem value="theme-blue">Blue</SelectItem>
                      <SelectItem value="theme-violet">Violet</SelectItem>
                      <SelectItem value="theme-yellow">Yellow</SelectItem>
                      <SelectItem value="theme-orange">Orange</SelectItem>
                      <SelectItem value="theme-red">Red</SelectItem>
                      <SelectItem value="theme-rose">Rose</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 space-y-1">
                <Label htmlFor="isPublic">Make Schedule Public</Label>
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
  );
}
