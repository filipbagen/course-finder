// next
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// components
import { SubmitButton } from '../../../components/shared/SubmitButtons';

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
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

// supabase
import { createClient } from '@/lib/supabase/server';

// prisma
import { prisma } from '@/lib/prisma';

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
      image: true,
    },
  });

  return data;
}

export default async function SettingPage() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Redirect if not authenticated
  if (!user || error) {
    redirect('/login');
  }

  // Get user data from database
  const data = await getData(user.id);

  async function postData(formData: FormData) {
    'use server';

    // Re-verify auth in server action
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!user || error) {
      redirect('/login');
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const colorScheme = formData.get('color') as string;
    const isPublic = formData.get('isPublic');
    const program = formData.get('program') as string;
    const image = formData.get('image') as string;
    const pictureFile = formData.get('picture') as File;

    const updateData: any = {
      name: name || undefined,
      email: email || undefined,
      colorScheme: colorScheme || undefined,
      program: program || undefined,
    };

    // Handle image upload or URL
    if (pictureFile && pictureFile.size > 0) {
      try {
        // Check file size (5MB limit)
        if (pictureFile.size > 5 * 1024 * 1024) {
          console.error('File too large. Maximum size is 5MB.');
          throw new Error('File too large');
        }

        const fileExt = pictureFile.name.split('.').pop();
        const filePath = `${user.id}-${Date.now()}.${fileExt}`;

        console.log('Uploading file to Supabase Storage...', filePath);

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, pictureFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          // If bucket doesn't exist, try to create it
          if (uploadError.message.includes('not found')) {
            console.log('Bucket not found, trying to create...');
            const { error: bucketError } = await supabase.storage.createBucket(
              'avatars',
              { public: true }
            );

            if (bucketError) {
              console.error('Could not create bucket:', bucketError);
            } else {
              // Retry upload after creating bucket
              const { error: retryError } = await supabase.storage
                .from('avatars')
                .upload(filePath, pictureFile);

              if (!retryError) {
                const { data } = supabase.storage
                  .from('avatars')
                  .getPublicUrl(filePath);

                updateData.image = data.publicUrl;
                console.log(
                  'File uploaded successfully after creating bucket:',
                  data.publicUrl
                );
              }
            }
          }
        } else {
          // Get the public URL for the uploaded file
          const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          updateData.image = data.publicUrl;
          console.log('File uploaded successfully:', data.publicUrl);
        }
      } catch (error) {
        console.error('File upload failed:', error);
      }
    } else if (image) {
      updateData.image = image;
    }

    // Only update isPublic if the switch was interacted with
    if (isPublic !== null) {
      updateData.isPublic = isPublic === 'on';
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: updateData,
    });

    revalidatePath('/', 'layout');
    revalidatePath('/settings');
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto px-4">
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
            <h1 className="text-3xl font-bold">Inställningar</h1>
            <p className="text-muted-foreground">
              Hantera dina profilinställningar och preferenser
            </p>
          </div>
        </div>

        <form action={postData} className="space-y-8">
          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Profilinformation
              </CardTitle>
              <CardDescription>
                Grundläggande information om din profil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture Section */}
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={data?.image || ''} />
                  <AvatarFallback className="text-lg">
                    {getInitials(data?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <Label htmlFor="picture">Profilbild</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="picture"
                        name="picture"
                        type="file"
                        accept="image/*"
                        className="max-w-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      {data?.image && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Ta bort
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ladda upp en profilbild (JPG, PNG, GIF - max 5MB)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Eller ange bild-URL</Label>
                    <Input
                      name="image"
                      type="url"
                      id="image"
                      placeholder="https://exempel.se/bild.jpg"
                      defaultValue={data?.image || ''}
                      className="max-w-sm"
                    />
                    <p className="text-sm text-muted-foreground">
                      Alternativt: länka till en befintlig bild
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Namn</Label>
                  <Input
                    name="name"
                    type="text"
                    id="name"
                    placeholder="Ditt fullständiga namn"
                    defaultValue={data?.name || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-postadress</Label>
                  <Input
                    name="email"
                    type="email"
                    id="email"
                    placeholder="din@email.se"
                    defaultValue={data?.email || user.email || ''}
                  />
                </div>
              </div>

              {/* Program Selection */}
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Select name="program" defaultValue={data?.program || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj ditt civilingenjörsprogram" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Civilingenjörsprogram</SelectLabel>
                      <SelectItem value="Medicinsk teknik">
                        Medicinsk teknik
                      </SelectItem>
                      <SelectItem value="Informationsteknologi">
                        Informationsteknologi
                      </SelectItem>
                      <SelectItem value="Kommunikation, transport och samhälle">
                        Kommunikation, transport och samhälle
                      </SelectItem>
                      <SelectItem value="Industriell ekonomi - internationell">
                        Industriell ekonomi - internationell
                      </SelectItem>
                      <SelectItem value="Industriell ekonomi">
                        Industriell ekonomi
                      </SelectItem>
                      <SelectItem value="Medieteknik">Medieteknik</SelectItem>
                      <SelectItem value="Elektronikdesign">
                        Elektronikdesign
                      </SelectItem>
                      <SelectItem value="Energi - miljö - management">
                        Energi - miljö - management
                      </SelectItem>
                      <SelectItem value="Design och produktutveckling">
                        Design och produktutveckling
                      </SelectItem>
                      <SelectItem value="Maskinteknik">Maskinteknik</SelectItem>
                      <SelectItem value="Mjukvaruteknik">
                        Mjukvaruteknik
                      </SelectItem>
                      <SelectItem value="Datateknik">Datateknik</SelectItem>
                      <SelectItem value="Teknisk fysik och elektroteknik">
                        Teknisk fysik och elektroteknik
                      </SelectItem>
                      <SelectItem value="Teknisk fysik och elektroteknik - internationell">
                        Teknisk fysik och elektroteknik - internationell
                      </SelectItem>
                      <SelectItem value="Kemisk biologi">
                        Kemisk biologi
                      </SelectItem>
                      <SelectItem value="Teknisk biologi">
                        Teknisk biologi
                      </SelectItem>
                      <SelectItem value="Datadriven utveckling">
                        Datadriven utveckling
                      </SelectItem>
                      <SelectItem value="Medieteknik och AI">
                        Medieteknik och AI
                      </SelectItem>
                      <SelectItem value="Teknisk matematik">
                        Teknisk matematik
                      </SelectItem>
                      <SelectItem value="Elektronik och systemdesign">
                        Elektronik och systemdesign
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Appearance & Privacy Card */}
          <Card>
            <CardHeader>
              <CardTitle>Utseende & Integritet</CardTitle>
              <CardDescription>
                Anpassa hur din profil visas och fungerar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Scheme */}
              <div className="space-y-2">
                <Label htmlFor="color">Färgschema</Label>
                <Select
                  name="color"
                  defaultValue={data?.colorScheme || 'theme-blue'}
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Välj färgschema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Färger</SelectLabel>
                      <SelectItem value="theme-blue">🔵 Blå</SelectItem>
                      <SelectItem value="theme-green">🟢 Grön</SelectItem>
                      <SelectItem value="theme-violet">🟣 Lila</SelectItem>
                      <SelectItem value="theme-yellow">🟡 Gul</SelectItem>
                      <SelectItem value="theme-orange">🟠 Orange</SelectItem>
                      <SelectItem value="theme-red">🔴 Röd</SelectItem>
                      <SelectItem value="theme-rose">🌹 Rosa</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Privacy Settings */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="isPublic" className="text-base">
                    Publikt schema
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Tillåt andra att se ditt kursschema
                  </p>
                </div>
                <Switch
                  defaultChecked={data?.isPublic ?? true}
                  id="isPublic"
                  name="isPublic"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
