// next
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

// supabase
import { createClient } from '@/lib/supabase/server';

// prisma
import { prisma } from '@/lib/prisma';

async function deleteProfileImage(userId: string) {
  'use server';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    redirect('/login');
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

async function deleteAccount(userId: string) {
  'use server';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    redirect('/login');
  }

  try {
    // Delete user's enrollments
    await prisma.enrollment.deleteMany({
      where: { userId: userId },
    });

    // Delete user's reviews
    await prisma.review.deleteMany({
      where: { userId: userId },
    });

    // Delete user's profile image from storage if it exists
    const userData = await prisma.user.findUnique({
      where: { id: userId },
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
      where: { id: userId },
    });

    // Try to delete from Supabase Auth (this may fail without admin privileges)
    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        console.log(
          'Could not delete from Supabase Auth (admin privileges required):',
          authError.message
        );
        console.log(
          'User data deleted from database. Auth record may need manual deletion.'
        );
      } else {
        console.log('User deleted from Supabase Auth successfully');
      }
    } catch (authDeleteError) {
      console.log(
        'Auth deletion failed (expected without admin privileges):',
        authDeleteError
      );
      console.log(
        'User data deleted from database. Auth record may need manual deletion.'
      );
    }

    // Sign out the user BEFORE redirecting to ensure they're not authenticated
    await supabase.auth.signOut();

    revalidatePath('/', 'layout');
    redirect('/');
  } catch (error) {
    console.error('Error deleting account:', error);
    throw new Error('Failed to delete account. Please try again.');
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

  // This should never happen for authenticated users, but add a safeguard
  if (!data) {
    console.error('Authenticated user not found in database:', user.id);
    redirect('/login');
  }

  // Create a bound function for deleting the profile image
  const handleDeleteImage = async () => {
    'use server';
    await deleteProfileImage(user.id);
  };

  // Create a bound function for deleting the account
  const handleDeleteAccount = async () => {
    'use server';
    await deleteAccount(user.id);
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

    // Handle password change
    if (newPassword && newPassword.trim()) {
      // Validate password fields
      if (!currentPassword || !currentPassword.trim()) {
        throw new Error('Current password is required to change password');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }

      // First verify the current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        throw new Error('Could not update password');
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
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile settings and preferences
            </p>
          </div>
        </div>

        <SettingsForm action={postData}>
          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Profile Information
              </CardTitle>
              <CardDescription>
                Basic information about your profile
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
                    <Label htmlFor="picture">Profile Picture</Label>
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
                      Upload a profile picture (JPG, PNG, GIF - max 5MB)
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    name="name"
                    type="text"
                    id="name"
                    placeholder="Your full name"
                    defaultValue={data?.name || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    name="email"
                    type="email"
                    id="email"
                    placeholder="your@email.com"
                    defaultValue={data?.email || user.email || ''}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Select name="program" defaultValue={data?.program || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your engineering program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Engineering Programs</SelectLabel>
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
              <CardTitle>Appearance & Privacy</CardTitle>
              <CardDescription>
                Customize how your profile appears and functions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Scheme */}
              <div className="space-y-2">
                <Label htmlFor="color">Color Scheme</Label>
                <Select
                  name="color"
                  defaultValue={data?.colorScheme || 'theme-blue'}
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Colors</SelectLabel>
                      <SelectItem value="theme-zinc">⚫ Zinc</SelectItem>
                      <SelectItem value="theme-slate">⚫ Slate</SelectItem>
                      <SelectItem value="theme-stone">⚫ Stone</SelectItem>
                      <SelectItem value="theme-gray">⚫ Gray</SelectItem>
                      <SelectItem value="theme-neutral">⚫ Neutral</SelectItem>
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
                    Public Schedule
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your course schedule
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
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  name="current_password"
                  type="password"
                  id="current_password"
                  placeholder="Enter your current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  name="new_password"
                  type="password"
                  id="new_password"
                  placeholder="Enter your new password"
                />
                <p className="text-sm text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  name="confirm_password"
                  type="password"
                  id="confirm_password"
                  placeholder="Confirm your new password"
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
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that will permanently delete your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-destructive/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Deleting your account will permanently remove all your data
                including: your profile, course reviews, enrollments, and
                uploaded images. This action cannot be undone.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <form action={handleDeleteAccount}>
              <Button
                type="submit"
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
