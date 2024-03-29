import { zodResolver } from "@hookform/resolvers/zod"
import currencyCodes from "currency-codes"
import { Loader } from "lucide-react"
import { type FC, useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { NumericFormat } from "react-number-format"
import { toast } from "sonner"

import { MarkdownEditor } from "@/components/md-editor"
import { Button } from "@/components/ui/button"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type ConferenceProfile,
  type UpdateConferenceInput,
  UpdateConferenceInputDto,
} from "@/contracts/conference/conference"
import { api } from "@/trpc/react"

export type UpdateConferenceProps = {
  conference: ConferenceProfile
  close: () => void
  refetch: () => void
}

export const UpdateConferenceForm: FC<UpdateConferenceProps> = ({
  conference,
  close,
  refetch,
}) => {
  const updateConference = api.conference.update.useMutation({
    onError: (error) => {
      const title =
        error instanceof Error ? error.message : "Conference update failed"
      toast.error(title)
      close()
    },
  })

  const form = useForm<UpdateConferenceInput>({
    resolver: zodResolver(UpdateConferenceInputDto),
    defaultValues: {
      id: conference.id,
      name: conference.name,
      description: conference.description,
      ticketDescription: conference.ticketDescription,
      ticketCurrency: conference.ticketCurrency,
      ticketPrice: conference.ticketPrice,
      startDate: conference.startDate,
      endDate: conference.endDate,
    },
  })

  const [hasTime, setHasTime] = useState(true)

  const onSubmit = useCallback(
    async (values: UpdateConferenceInput) => {
      if (
        conference.startDate !== values.startDate ||
        conference.endDate !== values.endDate
      ) {
        if (
          new Date(values.startDate ?? conference.startDate) >
          new Date(values.endDate ?? conference.endDate)
        ) {
          form.setError("startDate", {
            type: "manual",
            message: "Start date must be before end date",
          })
          return
        }
      }

      let ticketPrice: number | undefined = undefined
      let ticketCurrency: string | undefined = undefined
      if (
        values.ticketPrice !== conference.ticketPrice ||
        values.ticketCurrency !== conference.ticketCurrency
      ) {
        ticketPrice = values.ticketPrice ?? conference.ticketPrice
        ticketCurrency = values.ticketCurrency ?? conference.ticketCurrency
      }

      const valuesToSubmit: UpdateConferenceInput = {
        id: conference.id,
        name: conference.name !== values.name ? values.name : undefined,
        description:
          conference.description !== values.description
            ? values.description
            : undefined,
        ticketDescription:
          conference.ticketDescription !== values.ticketDescription
            ? values.ticketDescription
            : undefined,
        ticketPrice: ticketPrice,
        ticketCurrency: ticketCurrency,
        startDate:
          conference.startDate !== values.startDate
            ? values.startDate
            : undefined,
        endDate:
          conference.endDate !== values.endDate ? values.endDate : undefined,
      }

      await updateConference.mutateAsync(valuesToSubmit)
      toast.success("Conference Updated")
      refetch()
      close()
    },
    [conference],
  )

  const codes = useMemo(() => {
    return currencyCodes.data.map((code) => {
      return {
        label: `${code.code} - ${code.currency}`,
        value: code.code,
      }
    })
  }, [])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors, event) => {
          console.log("errors", errors, event)
          toast.error(
            `Failed to update conference with ${JSON.stringify(errors)}`,
          )
        })}
        className={"space-y-3"}>
        <FormField
          control={form.control}
          name={"name"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conference Name</FormLabel>
              <FormControl>
                <Input placeholder={"conference name"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"description"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <div>
                  <MarkdownEditor
                    name={field.name}
                    value={field.value!}
                    onChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"ticketDescription"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ticket Description</FormLabel>
              <FormControl>
                <Input placeholder={"ticket description"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className={"flex space-x-2"}>
          <div className={"flex-1"}>
            <FormField
              control={form.control}
              name={"ticketPrice"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <NumericFormat
                      placeholder={"price"}
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange({
                          target: {
                            value: value.floatValue,
                            name: field.name,
                          },
                        })
                      }
                      customInput={Input}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={"flex-1"}>
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {codes.map((code) => (
                          <SelectItem value={code.value} key={code.value}>
                            {code.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name={"ticketCurrency"}
              control={form.control}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name={"startDate"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <div>
                  <DateTimePicker
                    onChange={(value) => {
                      field.onChange(value.date.toISOString())
                      setHasTime(value.hasTime)
                      if (
                        value.date >
                        new Date(form.watch("endDate") ?? conference.endDate)
                      ) {
                        form.setValue("endDate", value.date.toISOString())
                      }
                    }}
                    value={{
                      date: new Date(field.value ?? conference.startDate),
                      hasTime: hasTime,
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={"endDate"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <div>
                  <DateTimePicker
                    onChange={(value) => {
                      field.onChange(value.date.toISOString())
                      setHasTime(value.hasTime)
                    }}
                    value={{
                      date: new Date(field.value ?? conference.endDate),
                      hasTime: hasTime,
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className={"flex justify-end"}>
          <Button type={"submit"} disabled={updateConference.isLoading}>
            {updateConference.isLoading && (
              <Loader className={"animate-spin"} />
            )}
            Update Conference
          </Button>
        </div>
      </form>
    </Form>
  )
}
