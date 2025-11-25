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

  // Serialize dates to ISO strings for client components
  const serializedUser = {
    ...user,
    createdAt: (user.createdAt instanceof Date ? user.createdAt : new Date()).toISOString(),
    updatedAt: (user.updatedAt instanceof Date ? user.updatedAt : new Date()).toISOString(),
    lastLoginAt: user.lastLoginAt
      ? (user.lastLoginAt instanceof Date ? user.lastLoginAt : new Date()).toISOString()
      : null,
  }

  const lastLogin = serializedUser.lastLoginAt

  return <UserDetailClient user={serializedUser} lastLogin={lastLogin} />
}

