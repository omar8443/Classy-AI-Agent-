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

  // Deep serialize to plain JSON objects
  const serializedUser = JSON.parse(JSON.stringify(user))

  return <UserDetailClient user={serializedUser} />
}

