type ConfirmVariant = "danger" | "success" | "primary";

type DeleteConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  isDeleting?: boolean;
  error?: string;
  confirmText?: string;
  loadingText?: string;
  variant?: ConfirmVariant;
  onClose: () => void;
  onConfirm: () => void;
};

const variantClasses: Record<ConfirmVariant, string> = {
  danger: "bg-red-600 hover:bg-red-700",
  success: "bg-green-600 hover:bg-green-700",
  primary: "bg-[#2563EB] hover:bg-blue-700",
};

export default function DeleteConfirmModal({
  isOpen,
  title,
  description,
  isDeleting = false,
  error,
  confirmText = "Delete",
  loadingText,
  variant = "danger",
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-[#E2E8F0] px-6 py-4">
          <h2 className="text-lg font-bold text-[#0F172A]">{title}</h2>
          <p className="mt-1 text-sm text-[#64748B]">{description}</p>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-60"
          >
            Back
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]}`}
          >
            {isDeleting ? loadingText || `${confirmText}...` : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
