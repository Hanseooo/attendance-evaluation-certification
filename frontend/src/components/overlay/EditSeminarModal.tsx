import CreateSeminarModal from "./CreateSeminarModal"
import type { Seminar } from "@/utils/types"

interface EditSeminarModalProps {
  seminar: Seminar | null
  isOpen: boolean
  onClose: () => void
  onSave: (seminar: Seminar) => void
}

export default function EditSeminarModal({ seminar, isOpen, onClose, onSave }: EditSeminarModalProps) {
  return (
    <CreateSeminarModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      seminar={seminar}
    />
  )
}
