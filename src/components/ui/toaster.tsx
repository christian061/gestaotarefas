"use client"

import { useEffect } from "react"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  useEffect(() => {
    const ids = toasts.filter((t) => t.open).map((t) => t.id)
    const timers = ids.map((id) => setTimeout(() => dismiss(id), 2500))
    return () => timers.forEach(clearTimeout)
  }, [toasts, dismiss])

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant }) {
        return (
          <Toast key={id} variant={variant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
