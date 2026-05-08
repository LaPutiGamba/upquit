"use client";

import { useTranslations, useFormatter } from "next-intl";
import Image from "next/image";
import { UserResponse } from "@/features/authentication/services/authService";
import { Card } from "@/shared/components/ui/card";
import { formatMonthYearWithFormatter } from "@/shared/lib/date";

interface UserProfileClientProps {
  user: UserResponse;
}

export default function UserProfileClient({ user }: UserProfileClientProps) {
  const t = useTranslations("users.profile");
  const formatter = useFormatter();

  if (!user.isActive) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-500 dark:text-slate-400">{t("deleted")}</h1>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-8">
        {/* Profile Header */}
        <Card className="p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.displayName}
                  width={120}
                  height={120}
                  className="rounded-full w-32 h-32 object-cover"
                  priority
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{user.displayName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.displayName}</h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 mt-1">@{user.username}</p>

              {user.createdAt && (
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
                  {t("joinedOn")} {formatMonthYearWithFormatter(formatter, user.createdAt)}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Placeholder Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Public Boards Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{t("publicBoards")}</h2>
            <div className="text-slate-600 dark:text-slate-400">{t("noPublicBoards")}</div>
          </Card>

          {/* Public Requests Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{t("publicRequests")}</h2>
            <div className="text-slate-600 dark:text-slate-400">{t("noPublicRequests")}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
