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

  // Serialize Firestore Timestamps to plain objects
  const serializedUser = {
    ...user,
    createdAt: user.createdAt instanceof Date ? user.createdAt : user.createdAt?.toDate?.() || new Date(),
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt : user.updatedAt?.toDate?.() || new Date(),
    lastLoginAt: user.lastLoginAt
      ? user.lastLoginAt instanceof Date
        ? user.lastLoginAt
        : user.lastLoginAt.toDate?.() || new Date()
      : null,
  }

  const lastLogin = serializedUser.lastLoginAt

  return <UserDetailClient user={serializedUser} lastLogin={lastLogin} />
}

