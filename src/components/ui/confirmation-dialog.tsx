"use client"

import * as React from "react"
import { AlertTriangle, Trash2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface ConfirmationDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "warning" | "success"
  onConfirm?: () => void
  onCancel?: () => void
  loading?: boolean
  icon?: React.ReactNode
}

const variantConfig = {
  default: {
    icon: AlertCircle,
    titleClass: "text-foreground",
    iconClass: "text-blue-500",
    confirmVariant: "default" as const,
  },
  destructive: {
    icon: Trash2,
    titleClass: "text-destructive",
    iconClass: "text-destructive",
    confirmVariant: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    titleClass: "text-yellow-600 dark:text-yellow-500",
    iconClass: "text-yellow-500",
    confirmVariant: "default" as const,
  },
  success: {
    icon: CheckCircle,
    titleClass: "text-green-600 dark:text-green-500",
    iconClass: "text-green-500",
    confirmVariant: "default" as const,
  },
}

export function ConfirmationDialog({
  open = false,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  loading = false,
  icon,
}: ConfirmationDialogProps) {
  const config = variantConfig[variant]
  const IconComponent = icon || config.icon

  const handleConfirm = () => {
    onConfirm?.()
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange?.(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      onCancel?.()
    }
    onOpenChange?.(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!loading}>
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <IconComponent className={cn("h-6 w-6", config.iconClass)} />
          </div>
          <DialogTitle className={cn("text-lg font-semibold", config.titleClass)}>
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-center text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row-reverse sm:gap-2">
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? "Processing..." : confirmText}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Convenience hook for easier usage
export function useConfirmationDialog() {
  const [state, setState] = React.useState({
    open: false,
    title: "Are you sure?",
    description: "This action cannot be undone.",
    confirmText: "Continue",
    cancelText: "Cancel",
    variant: "default" as const,
    loading: false,
  })

  const [handlers, setHandlers] = React.useState<{
    onConfirm?: () => void
    onCancel?: () => void
  }>({})

  const showDialog = React.useCallback((options: {
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive" | "warning" | "success"
    onConfirm?: () => void
    onCancel?: () => void
  }) => {
    setState(prev => ({
      ...prev,
      open: true,
      title: options.title || "Are you sure?",
      description: options.description || "This action cannot be undone.",
      confirmText: options.confirmText || "Continue",
      cancelText: options.cancelText || "Cancel",
      variant: options.variant || "default",
      loading: false,
    }))
    setHandlers({
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    })
  }, [])

  const hideDialog = React.useCallback(() => {
    setState(prev => ({ ...prev, open: false, loading: false }))
  }, [])

  const setLoading = React.useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  const dialog = (
    <ConfirmationDialog
      {...state}
      onOpenChange={hideDialog}
      onConfirm={handlers.onConfirm}
      onCancel={handlers.onCancel}
    />
  )

  return {
    dialog,
    showDialog,
    hideDialog,
    setLoading,
    isOpen: state.open,
    isLoading: state.loading,
  }
}

// Pre-configured dialogs for common use cases
export const useDeleteConfirmation = () => {
  const { dialog, showDialog, hideDialog, setLoading } = useConfirmationDialog()

  const showDeleteConfirmation = React.useCallback((options: {
    title?: string
    description?: string
    itemName?: string
    onConfirm?: () => void
    onCancel?: () => void
  }) => {
    const itemName = options.itemName || "item"
    showDialog({
      title: options.title || `Delete ${itemName}?`,
      description: options.description || `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    })
  }, [showDialog])

  return {
    dialog,
    showDeleteConfirmation,
    hideDialog,
    setLoading,
  }
}