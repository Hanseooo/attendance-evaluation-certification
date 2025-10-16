import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Seminar } from "@/utils/types"

interface CreateSeminarModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (seminar: Seminar) => void
  seminar?: Seminar | null
}

export default function CreateSeminarModal({ isOpen, onClose, onSave, seminar }: CreateSeminarModalProps) {
  const [form, setForm] = useState<Partial<Seminar>>({
    title: "",
    description: "",
    venue: "",
    date_start: "",
    date_end: "",
    duration_minutes: 60,
  })

  // ✅ Prefill when editing
  useEffect(() => {
    if (seminar) {
      setForm({
        id: seminar.id,
        title: seminar.title,
        description: seminar.description,
        venue: seminar.venue,
        date_start: seminar.date_start,
        date_end: seminar.date_end,
        duration_minutes: seminar.duration_minutes,
      })
    } else {
      setForm({
        title: "",
        description: "",
        venue: "",
        date_start: "",
        date_end: "",
        duration_minutes: 60,
      })
    }
  }, [seminar])

  const handleChange = (field: keyof Seminar, value: string | number | Date) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!form.title || !form.date_start) return
    const newSeminar = { ...form, id: form.id ?? Date.now() } as Seminar
    onSave(newSeminar)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl overflow-y-auto max-h-[90vh] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {seminar ? "Edit Seminar" : "Create Seminar"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field label="Title">
            <Input
              value={form.title ?? ""}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter seminar title"
            />
          </Field>

          <Field label="Description">
            <Textarea
              rows={4}
              value={form.description ?? ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief seminar overview"
            />
          </Field>

          <Field label="Venue">
            <Input
              value={form.venue ?? ""}
              onChange={(e) => handleChange("venue", e.target.value)}
              placeholder="Venue or location"
            />
          </Field>

          <DateTimePicker
            label="Start Date & Time"
            value={form.date_start}
            onChange={(v) => handleChange("date_start", v)}
          />

          <DateTimePicker
            label="End Date & Time"
            value={form.date_end}
            onChange={(v) => handleChange("date_end", v)}
          />

          <Field label="Duration (minutes)">
            <Input
              type="number"
              value={form.duration_minutes ?? ""}
              onChange={(e) => handleChange("duration_minutes", Number(e.target.value))}
              placeholder="e.g. 90"
            />
          </Field>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="default" onClick={handleSave} className="w-full sm:w-auto">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------- FIELD WRAPPER -------------------- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

/* -------------------- DATE TIME PICKER -------------------- */
function DateTimePicker({
  label,
  value,
  onChange,
}: {
  label: string
  value?: string
  onChange: (v: string) => void
}) {
  const date = value ? new Date(value) : undefined

  const handleTimeChange = (type: "hour" | "minute" | "ampm", val: string) => {
    if (!date) return
    const d = new Date(date)
    const h = d.getHours()
    if (type === "hour") {
      const hour = Number(val)
      const ampm = h >= 12 ? 12 : 0
      d.setHours((hour % 12) + ampm)
    } else if (type === "minute") {
      d.setMinutes(Number(val))
    } else if (type === "ampm") {
      if (val === "PM" && h < 12) d.setHours(h + 12)
      if (val === "AM" && h >= 12) d.setHours(h - 12)
    }
    onChange(d.toISOString())
  }

  return (
    <Field label={label}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("justify-start text-left font-normal w-full", !value && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {value ? format(new Date(value), "PPP hh:mm aa") : `Pick ${label.toLowerCase()}`}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          side="bottom"
          className="p-4 w-[95vw] sm:w-[360px] bg-background/95 backdrop-blur-md border border-border/40 rounded-xl shadow-md"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && onChange(d.toISOString())}
            className="rounded-md mx-auto w-full sm:w-auto"
          />

          <div className="mt-3 flex flex-wrap justify-center sm:justify-between gap-3 items-center">
            <Input
              type="number"
              min={1}
              max={12}
              value={date ? (date.getHours() % 12 || 12) : ""}
              placeholder="HH"
              onChange={(e) => handleTimeChange("hour", e.target.value)}
              className="w-16 text-center"
            />
            <span>:</span>
            <Input
              type="number"
              min={0}
              max={59}
              value={date ? date.getMinutes() : ""}
              placeholder="MM"
              onChange={(e) => handleTimeChange("minute", e.target.value)}
              className="w-16 text-center"
            />
            <select
              value={date && date.getHours() >= 12 ? "PM" : "AM"}
              onChange={(e) => handleTimeChange("ampm", e.target.value)}
              className="border border-border rounded-md px-2 py-1 text-sm"
            >
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
        </PopoverContent>
      </Popover>
    </Field>
  )
}
