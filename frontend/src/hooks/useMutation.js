"use client"

import { useRef, useState } from "react"
import { handleUnauthorized } from "@/lib/handleUnauthorized"


export const useMutation = () => {
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [error, setError] = useState(false)
    // the server's own message for a rejected request (e.g. "Not enough stock").
    // A ref, so it can be read right after `await makeRequest(...)` returns.
    const errorMessageRef = useRef(null)

    const makeRequest = async ({url, method = "POST", body}) => {
        try {
            errorMessageRef.current = null
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
                // only client errors (4xx) carry a message meant for the user;
                // 5xx messages are internal, and 401 just redirects to login
                if (result.status >= 400 && result.status < 500 && result.status !== 401) {
                    const errorBody = await result.json().catch(() => null)
                    errorMessageRef.current = errorBody?.error ?? null
                }
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

    return { data, isLoading, isError, error, makeRequest, errorMessageRef}
}