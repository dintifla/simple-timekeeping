import { useEffect, useRef } from "react";
import { Button } from "./ui/Button";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Accessible confirmation modal built on the native <dialog> element. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Bestätigen",
  cancelLabel = "Abbrechen",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClose={onCancel}
      aria-labelledby="confirm-title"
      className="m-auto max-w-sm rounded-xl border border-border bg-surface p-0 text-text shadow-pop backdrop:bg-black/40"
    >
      <div className="p-5">
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-muted">{description}</p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
