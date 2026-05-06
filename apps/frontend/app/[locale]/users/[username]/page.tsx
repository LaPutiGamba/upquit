import { notFound } from "next/navigation";
import { authService, type UserResponse } from "@/features/authentication/services/authService";
import UserProfileContent from "@/features/users/components/UserProfileContent";

interface ProfilePageProps {
  params: Promise<{
    locale: string;
    username: string;
  }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;

  return {
    title: `${username} - UpQuit`,
    description: `${username}'s profile`
  };
}

async function getUserProfile(username: string): Promise<UserResponse | null> {
  try {
    return await authService.getUserByUsername(username);
  } catch {
    return null;
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  const user = await getUserProfile(username);

  if (!user) {
    notFound();
  }

  return <UserProfileContent user={user} />;
}
