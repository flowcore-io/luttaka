import { Loader, PenIcon, Trash } from "lucide-react"
import Image from "next/image"
import { useCallback, useState } from "react"
import { toast } from "sonner"

import { UpdateConferenceForm } from "@/app/admin/conferences/update-conference.form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { api } from "@/trpc/react"

export interface ConferenceProps {
  conference: {
    id: string
    name: string
    description: string | null
    ticketDescription: string | null
    ticketPrice: number
    ticketCurrency: string
    startDate: string
    endDate: string
    stripeId: string
  }
  refetch: () => Promise<void>
}

export function Conference({ conference, refetch }: ConferenceProps) {
  const [loading, setLoading] = useState(false)

  const apiArchiveConference = api.conference.archive.useMutation()
  const archiveConference = useCallback(async () => {
    setLoading(true)
    const success = await apiArchiveConference.mutateAsync({
      id: conference.id,
    })
    if (success) {
      await refetch()
      toast.success("Conference deleted")
    } else {
      toast.error("Delete conference failed")
    }
    setLoading(false)
  }, [conference.id])

  const [updateConferenceDialogOpened, setUpdateConferenceDialogOpened] =
    useState(false)

  return (
    <>
      <div
        key={conference.id}
        className="mb-2 flex cursor-pointer items-center rounded-lg border p-4 shadow transition hover:scale-101 hover:shadow-lg">
        <div className={"pr-4"}>
          <Image
            src={"/images/tonik.svg"}
            width={120}
            height={120}
            alt={"Tonik"}
          />
        </div>
        <div className={"flex-1 self-stretch"}>
          <div className={"pb-2 font-bold"}>{conference.name}</div>
          <div className={"text-sm text-gray-500"}>
            {conference.description}
          </div>
          <div className={"text-sm text-gray-500"}>
            Conference ID: {conference.id}
          </div>
          <div className={"text-sm text-gray-500"}>
            Stripe ID: {conference.stripeId}
          </div>
          <div className={"text-sm text-gray-500"}>
            Price: {conference.ticketPrice} {conference.ticketCurrency}
          </div>
          <div className={"text-sm text-gray-500"}>
            Start: {conference.startDate}
          </div>
          <div className={"text-sm text-gray-500"}>
            End: {conference.endDate}
          </div>
        </div>
        <div className={"text-right"}>
          <Button
            size={"sm"}
            onClick={() => setUpdateConferenceDialogOpened(true)}
            disabled={loading}>
            {loading ? <Loader className={"animate-spin"} /> : <PenIcon />}
          </Button>
          <Button
            className={"ml-2"}
            size={"sm"}
            onClick={(e) => {
              e.stopPropagation()
              return archiveConference()
            }}
            disabled={loading}>
            {loading ? <Loader className={"animate-spin"} /> : <Trash />}
          </Button>
        </div>
        <Dialog
          open={updateConferenceDialogOpened}
          onOpenChange={(open) => {
            !open && setUpdateConferenceDialogOpened(open)
          }}>
          <DialogContent className={"max-w-4xl"}>
            <DialogHeader>Create new conference</DialogHeader>
            <UpdateConferenceForm
              conference={{
                ...conference,
                ticketDescription: conference.ticketDescription ?? "",
                description: conference.description ?? "",
              }}
              close={() => setUpdateConferenceDialogOpened(false)}
              refetch={() => refetch()}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
