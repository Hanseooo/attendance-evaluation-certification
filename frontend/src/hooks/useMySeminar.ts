import { useState, useEffect, useCallback } from "react"
import { useMySeminarList } from "@/stores/SeminarStore"
import type { MySeminar, Seminar } from "@/utils/types"
import { useAuth } from "@/context/AuthContext"

export function useFetchMySeminars() {
  const { setSeminar } = useMySeminarList() // get setter from Zustand
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const authToken = useAuth().token

  const fetchMySeminars = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/api/planned-seminars/", {
      headers: {
        "Authorization": `Token ${authToken}`,
        "Content-Type": "application/json",
      },
    })
      if (!res.ok) throw new Error("Failed to fetch your seminars")
      const data: MySeminar[] = await res.json()
      setSeminar(data) // update Zustand store
      setError(null)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred")
      }
    } finally {
      setLoading(false)
    }
  }, [setSeminar, authToken])

  useEffect(() => {
    fetchMySeminars()
  }, [fetchMySeminars])

  return { loading, error, fetchMySeminars }
}

export function usePostMySeminar() {
//   const { seminar, clearSeminar } = useUserSeminar() // get seminar from the store
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const authToken = useAuth().token


    const postMySeminar = async (id: number) => {
    if (!id) {
        setError("No seminar to post")
        return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
        const res = await fetch("http://127.0.0.1:8000/api/planned-seminars/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authToken}`,
        },
        body: JSON.stringify({ seminar: id }),
        })

        if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Failed to post seminar")
        }

        const data: Seminar = await res.json()
        setSuccess(true)
        return data
    } catch (err: unknown) {
        if (err instanceof Error) {
        setError(err.message)
        console.error(err)
        } else {
        setError("An unknown error occurred")
        console.error(err)
        }
        setSuccess(false)
    } finally {
        setLoading(false)
    }
    }

    return { loading, error, success, postMySeminar }
}


export function useDeleteMySeminar()  {
    //   const { seminar, clearSeminar } = useUserSeminar() // get seminar from the store
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const authToken = useAuth().token
  const removeSeminar = useMySeminarList().removeSeminar


    const deleteMySeminar = async (id: number) => {
    if (!id) {
        setError("No seminar to delete")
        return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/planned-seminars/${id}/`, {
        method: "DELETE",
        headers: {
            Authorization: `Token ${authToken}`,
        },
        })

        if (!res.ok) {

        let errorMsg = "Failed to delete seminar"
        try {
            const data = await res.json()
            if (data.detail) errorMsg = data.detail
        } catch {
            // response is likely empty (204)
        }
        throw new Error(errorMsg)
        }
        setSuccess(true)
        removeSeminar(id)
        return true
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unknown error occurred"
        setError(message)
        console.error(message)
        setSuccess(false)
    } finally {
        setLoading(false)
    }
    }

    return { loading, error, success, deleteMySeminar }

}


