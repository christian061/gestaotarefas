// Forked from shadcn/ui template
import * as React from "react"

import type {
  ToastActionElement,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

export type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

export const toastTimeouts = new Map<string, ReturnType<typeof setTimeout> | undefined>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export type ToastAction =
  | {
      type: "ADD_TOAST"
      toast: Toast
    }
  | {
      type: "UPDATE_TOAST"
      toast: Partial<Toast>
    }
  | {
      type: "DISMISS_TOAST"
      toastId?: string
    }
  | {
      type: "REMOVE_TOAST"
      toastId?: string
    }

export const reducer = (state: Toast[], action: ToastAction): Toast[] => {
  switch (action.type) {
    case "ADD_TOAST":
      return [
        action.toast,
        ...state.filter((t) => t.open),
      ].slice(0, TOAST_LIMIT)

    case "UPDATE_TOAST":
      return state.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      )

    case "DISMISS_TOAST": {
      const { toastId } = action

      addToRemoveQueue(toastId || "")

      return state.map((t) =>
        t.id === toastId || toastId === undefined ? { ...t, open: false } : t
      )
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return []
      }
      return state.filter((t) => t.id !== action.toastId)
  }
}

const listeners: Array<(state: Toast[]) => void> = []

let memoryState: Toast[] = []

function dispatch(action: ToastAction) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

export function toast({ ...props }: Omit<Toast, "id">) {
  const id = genId()

  const update = (props: Toast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

export function useToast() {
  const [state, setState] = React.useState<Toast[]>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [state])

  return {
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    toasts: state,
  }
}
