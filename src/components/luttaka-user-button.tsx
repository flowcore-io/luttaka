"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export const LuttakaUserButton = () => {
  const { isLoaded, user } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const router = useRouter()
  if (!isLoaded) return null
  if (!user?.id) return null

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex h-[63px] w-[63px] flex-row rounded-full bg-gradient-to-t from-[#FFDD57] to-[#FF51FF]">
          <Image
            unoptimized
            alt={
              user?.primaryEmailAddress?.emailAddress ?? "Email address missing"
            }
            src={user?.imageUrl}
            width={55}
            height={55}
            className="m-auto rounded-full"
          />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="mt-2 flex w-52 flex-col items-start rounded border border-gray-200 bg-white px-6 py-4 font-lato text-black drop-shadow-2xl">
          <DropdownMenu.Item asChild>
            <Link href="/me" passHref className="py-3">
              Profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/conferences" passHref className="py-3">
              Conferences
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <button onClick={() => openUserProfile()} className="py-3">
              Settings
            </button>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <button
              onClick={() => signOut(() => router.push("/"))}
              className="py-3">
              Sign Out{" "}
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
