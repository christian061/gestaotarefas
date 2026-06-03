import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastActionElement = React.ReactElement<typeof ToastAction>

// Noop provider to keep API similar to shadcn
export const ToastProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <>{children}</>
)

export const ToastViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
)
ToastViewport.displayName = "ToastViewport"

export const Toast = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" }>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
        variant === "destructive" ? "border-destructive bg-destructive text-destructive-foreground" : "border bg-background text-foreground",
        className
      )}
      {...props}
    />
  )
)
Toast.displayName = "Toast"

export const ToastAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      {...props}
    />
  )
)
ToastAction.displayName = "ToastAction"

export const ToastClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "absolute right-1 top-1 rounded-md p-1 text-foreground/50 transition-opacity hover:text-foreground focus:outline-none focus:ring-2",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  )
)
ToastClose.displayName = "ToastClose"

export const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
  )
)
ToastTitle.displayName = "ToastTitle"

export const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
  )
)
ToastDescription.displayName = "ToastDescription"

export {}
