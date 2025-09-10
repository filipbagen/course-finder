// next
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// components
import { SubmitButton } from '../../../components/shared/SubmitButtons';
import { DeleteImageButton } from '@/components/shared/DeleteImageButton';
import { SettingsForm } from '@/app/(dashboard)/settings/SettingsForm';
import { programs } from '@/lib/programs';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// supabase
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';

// prisma
import { prisma } from '@/lib/prisma';

const createAdminClient = async () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for account deletion'
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

function DeleteAccountDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Radera konto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Radera konto
          </DialogTitle>
          <DialogDescription>
            Denna åtgärd kan inte ångras. Detta kommer permanent att radera ditt
            konto och ta bort alla dina data från våra servrar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Alert className="border-destructive/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Vad kommer att raderas:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Din profil och personliga information</li>
                <li>Alla dina kursregistreringar och schema</li>
                <li>Alla dina kursrecensioner och betyg</li>
                <li>Din profilbild från vårt lagringsutrymme</li>
                <li>Ditt konto från vårt autentiseringssystem</li>
              </ul>
            </AlertDescription>
          </Alert>
          <form action={deleteAccount}>
            <div className="space-y-2">
              <Label
                htmlFor="delete-confirmation"
                className="text-sm font-medium"
              >
                Type <strong>RADERA</strong> to confirm:
              </Label>
              <Input
                id="delete-confirmation"
                name="confirmation"
                placeholder="Skriv RADERA för att bekräfta"
                className="border-destructive/50 focus:border-destructive"
                required
              />
            </div>
            <DialogFooter className="mt-6">
              <DialogTrigger asChild>
                <Button variant="outline">Avbryt</Button>
              </DialogTrigger>
              <Button type="submit" variant="destructive">
                Radera konto
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function deleteProfileImage(userId: string) {
  'use server';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    redirect('/login');
  }

  // Check if user still exists in database
  const userData = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userData) {
    console.error(
      'User not found in database during profile image deletion, signing out'
    );
    await supabase.auth.signOut();
    redirect('/');
  }

  try {
    // Get current user data to check if image is from Supabase Storage
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (userData?.image) {
      // Check if the image is from Supabase Storage (contains our storage URL pattern)
      if (
        userData.image.includes('supabase') &&
        userData.image.includes('avatars')
      ) {
        // Extract file path from the URL
        const urlParts = userData.image.split('/');
        const fileName = urlParts[urlParts.length - 1];

        // Delete from Supabase Storage
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([fileName]);

        if (deleteError) {
          console.error('Error deleting file from storage:', deleteError);
        }
      }
    }

    // Update database to remove image reference
    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    });

    revalidatePath('/settings');
  } catch (error) {
    console.error('Error deleting profile image:', error);
    throw error;
  }
}

async function deleteAccount(formData: FormData) {
  'use server';

  const confirmation = formData.get('confirmation') as string;

  if (confirmation !== 'RADERA') {
    throw new Error('Skriv RADERA för att bekräfta radering av konto');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  try {
    // Delete user's enrollments
    await prisma.enrollment.deleteMany({
      where: { userId: user.id },
    });

    // Delete user's reviews
    await prisma.review.deleteMany({
      where: { userId: user.id },
    });

    // Delete user's profile image from storage if it exists
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { image: true },
    });

    if (userData?.image) {
      if (
        userData.image.includes('supabase') &&
        userData.image.includes('avatars')
      ) {
        const urlParts = userData.image.split('/');
        const fileName = urlParts[urlParts.length - 1];

        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([fileName]);

        if (deleteError) {
          console.error(
            'Error deleting profile image from storage:',
            deleteError
          );
        }
      }
    }

    // Delete user from database
    await prisma.user.delete({
      where: { id: user.id },
    });

    // Delete from Supabase Auth using admin client
    const adminClient = await createAdminClient();
    console.log('Attempting to delete user from Supabase Auth:', user.id);

    const { data, error: authError } = await adminClient.auth.admin.deleteUser(
      user.id,
      false // shouldSoftDelete: false for complete deletion
    );

    if (authError) {
      console.error('Supabase Auth deletion failed:', {
        error: authError.message,
        status: authError.status,
        userId: user.id,
      });
      throw new Error(
        'Misslyckades att radera autentiseringskonto. Kontakta support.'
      );
    }

    console.log('✅ User completely deleted from Supabase Auth:', user.id);
    console.log('Response data:', data);

    // Sign out the user BEFORE redirecting to ensure they're not authenticated
    await supabase.auth.signOut();

    revalidatePath('/', 'layout');
    redirect('/');
  } catch (error) {
    console.error('Error deleting account:', error);
    throw new Error('Misslyckades att radera konto. Försök igen.');
  }
}

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

  // If user doesn't exist in database (e.g., account was deleted), sign out and redirect to home
  if (!data) {
    console.error(
      'Authenticated user not found in database, signing out:',
      user.id
    );
    await supabase.auth.signOut();
    redirect('/');
  }

  // Create a bound function for deleting the profile image
  const handleDeleteImage = async () => {
    'use server';
    await deleteProfileImage(user.id);
  };

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

    // Check if user still exists in database
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!existingUser) {
      console.error(
        'User not found in database during settings update, signing out'
      );
      await supabase.auth.signOut();
      redirect('/');
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const colorScheme = formData.get('color') as string;
    const isPublic = formData.get('isPublic');
    const program = formData.get('program') as string;
    const image = formData.get('image') as string;
    const pictureFile = formData.get('picture') as File;
    const currentPassword = formData.get('current_password') as string;
    const newPassword = formData.get('new_password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

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
          throw new Error('Filen är för stor');
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

    // Handle password change
    if (newPassword && newPassword.trim()) {
      // Validate password fields
      if (!currentPassword || !currentPassword.trim()) {
        throw new Error('Nuvarande lösenord krävs för att ändra lösenord');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Nya lösenorden matchar inte');
      }

      if (newPassword.length < 6) {
        throw new Error('Nytt lösenord måste vara minst 6 tecken långt');
      }

      // First verify the current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Nuvarande lösenord är felaktigt');
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        throw new Error('Kunde inte uppdatera lösenord');
      }
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col gap-8 mx-auto">
      <div className="grid items-start gap-8">
        <div className="flex items-center justify-between px-2">
          <div className="grid gap-1">
            <h1 className="text-3xl font-bold">Inställningar</h1>
            <p className="text-muted-foreground">
              Hantera dina profilinställningar och preferenser
            </p>
          </div>
        </div>

        <SettingsForm action={postData}>
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
                  <AvatarImage src={data?.image || undefined} />
                  <AvatarFallback className="text-lg">
                    {data.name ? getInitials(data.name) : 'U'}
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
                        className="max-w-sm cursor-pointer"
                      />
                      {data?.image && (
                        <DeleteImageButton onDelete={handleDeleteImage} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ladda upp en profilbild (JPG, PNG, GIF - max 5MB)
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
                    placeholder="din@email.com"
                    defaultValue={data?.email || user.email || ''}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Select name="program" defaultValue={data?.program || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj ditt ingenjörsprogram" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Ingenjörsprogram</SelectLabel>
                      {programs.map((program) => (
                        <SelectItem key={program} value={program}>
                          {program}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Appearance & Privacy Card */}
          <Card>
            <CardHeader>
              <CardTitle>Utsende & Sekretess</CardTitle>
              <CardDescription>
                Anpassa hur din profil ser ut och fungerar
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
                      <SelectItem value="theme-blue">🔵 Blue</SelectItem>
                      <SelectItem value="theme-green">🟢 Green</SelectItem>
                      <SelectItem value="theme-violet">🟣 Violet</SelectItem>
                      <SelectItem value="theme-yellow">🟡 Yellow</SelectItem>
                      <SelectItem value="theme-orange">🟠 Orange</SelectItem>
                      <SelectItem value="theme-red">🔴 Red</SelectItem>
                      <SelectItem value="theme-rose">🌹 Rose</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Privacy Settings */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="isPublic" className="text-base">
                    Offentligt schema
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

          {/* Password & Security Card */}
          <Card>
            <CardHeader>
              <CardTitle>Lösenord & Säkerhet</CardTitle>
              <CardDescription>
                Hantera ditt lösenord och säkerhetsinställningar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current_password">Nuvarande lösenord</Label>
                <Input
                  name="current_password"
                  type="password"
                  id="current_password"
                  placeholder="Ange ditt nuvarande lösenord"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">Nytt lösenord</Label>
                <Input
                  name="new_password"
                  type="password"
                  id="new_password"
                  placeholder="Ange ditt nya lösenord"
                />
                <p className="text-sm text-muted-foreground">
                  Lösenord måste vara minst 6 tecken långt
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Bekräfta nytt lösenord</Label>
                <Input
                  name="confirm_password"
                  type="password"
                  id="confirm_password"
                  placeholder="Bekräfta ditt nya lösenord"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <SubmitButton />
        </SettingsForm>

        {/* Danger Zone - Delete Account */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Farozon
            </CardTitle>
            <CardDescription>
              Oåterkalleliga åtgärder som permanent raderar dina data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-destructive/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Att radera ditt konto kommer permanent att ta bort alla dina
                data inklusive: din profil, kursrecensioner, registreringar och
                uppladdade bilder. Denna åtgärd kan inte ångras.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <DeleteAccountDialog />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
