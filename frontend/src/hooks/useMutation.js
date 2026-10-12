"use client"

import { useState } from "react"
import { handleUnauthorized } from "@/lib/handleUnauthorized"


export const useMutation = () => {
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [error, setError] = useState(false)

    const makeRequest = async ({url, method = "POST", body}) => {
        try {
            setIsLoading(true)
            const result = await fetch(`${url}`, ({
                method: `${method}`,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                credentials: "include"
            }))

            if (!result.ok) {
                setIsError(true)
                setError("There is a problem making request")
                setIsLoading(false)
                if (result.status === 401) handleUnauthorized()
                return
            }

            setData(result)
            setIsLoading(false)
            return true
        } catch (error) {
            setError("Request failed")
            setIsLoading(false)
            return false
        }
    }

    return { data, isLoading, isError, error, makeRequest}
}