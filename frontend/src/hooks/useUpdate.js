"use client"

import { useState } from "react"
import { handleUnauthorized } from "@/lib/handleUnauthorized"

export const useUpdate = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [isError, setIsError] = useState(false)
    const [data, setData] = useState(null)

    const updateStatus = async ({id, status, rejectionReason, items}) => {
        try {
            setIsLoading(true)
            const response = await fetch(`/api/pickup-requests/collection-requests/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({status, rejectionReason, items}),
                credentials: "include"
            })

            const result = await response.json()

            if (!response.ok) {
                setIsError(true)
                setError("There is a problem fetching data")
                if (response.status === 401) handleUnauthorized()
                return
            }
            
            setIsLoading(false)
            setData(result)
            return true
        } catch (error) {
            setIsError(true)
            setError("Fetch failed")
            return false
        }
    }

    return { data, isLoading, error, isError, updateStatus}
}