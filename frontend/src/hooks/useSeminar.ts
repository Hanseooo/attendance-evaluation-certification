import { useState, useEffect, useCallback } from "react"
import { useSeminarList } from "@/stores/SeminarStore"
import type { Seminar } from "@/utils/types"
import { useAuth } from "@/context/AuthContext"

export function useFetchSeminars() {
  const { setSeminar } = useSeminarList() // get setter from Zustand
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const token = useAuth().token

  const fetchSeminars = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/api/seminars", 
        {headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
      ) // your DRF endpoint
      if (!res.ok) throw new Error("Failed to fetch seminars")
      const data: Seminar[] = await res.json()
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
  }, [setSeminar])

  // Fetch automatically on hook mount
  useEffect(() => {
    fetchSeminars()
  }, [fetchSeminars])

  return { loading, error, fetchSeminars }
}

export function usePostSeminar() {
//   const { seminar, clearSeminar } = useUserSeminar() // get seminar from the store
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const authToken = useAuth().token


  const postSeminar = async (seminar : Seminar) => {
    if (!seminar) {
      setError("No seminar to post")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/seminars/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authToken}`
        },
        body: JSON.stringify(seminar),
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

  return { loading, error, success, postSeminar }
}

export function useUpdateSeminar()  {
    //   const { seminar, clearSeminar } = useUserSeminar() // get seminar from the store
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const authToken = useAuth().token


  const updateSeminar = async (seminar : Seminar) => {
    if (!seminar) {
      setError("No seminar to update")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/seminars/${seminar.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authToken}`
        },
        body: JSON.stringify(seminar),
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
    return { loading, error, success, updateSeminar }

}

export function useDeleteSeminar()  {
    //   const { seminar, clearSeminar } = useUserSeminar() // get seminar from the store
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const authToken = useAuth().token


    const deleteSeminar = async (id: number) => {
    if (!id) {
        setError("No seminar to delete")
        return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/seminars/${id}/`, {
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

    return { loading, error, success, deleteSeminar }

}


