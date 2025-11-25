import { notFound } from "next/navigation"
import { getUserById } from "@/lib/firestore/users"
import { UserDetailClient } from "@/components/users/user-detail-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  const lastLogin = user.lastLoginAt
    ? user.lastLoginAt instanceof Date
      ? user.lastLoginAt
      : user.lastLoginAt.toDate?.() || new Date()
    : null

  return <UserDetailClient user={user} lastLogin={lastLogin} />
}

