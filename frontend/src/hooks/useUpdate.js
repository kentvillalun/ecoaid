"use client"

import { useRef, useState } from "react"
import { handleUnauthorized } from "@/lib/handleUnauthorized"

export const useUpdate = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [isError, setIsError] = useState(false)
    const [data, setData] = useState(null)
    // the server's own message for a rejected request, readable right after
    // `await updateStatus(...)` returns
    const errorMessageRef = useRef(null)

    const updateStatus = async ({id, status, rejectionReason, items, isAssorted}) => {
        try {
            errorMessageRef.current = null
            setIsLoading(true)
            const response = await fetch(`/api/pickup-requests/collection-requests/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({status, rejectionReason, items, isAssorted}),
                credentials: "include"
            })

            const result = await response.json()

            if (!response.ok) {
                // only client errors (4xx) carry a message meant for the user
                if (response.status >= 400 && response.status < 500 && response.status !== 401) {
                    errorMessageRef.current = result?.error ?? null
                }
                setIsError(true)
                setError("There is a problem fetching data")
                setIsLoading(false)
                if (response.status === 401) handleUnauthorized(result)
                return false
            }
            
            setIsLoading(false)
            setData(result)
            return true
        } catch (error) {
            setIsError(true)
            setError("Fetch failed")
            setIsLoading(false)
            return false
        }
    }

    return { data, isLoading, error, isError, updateStatus, errorMessageRef}
}