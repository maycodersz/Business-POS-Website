import { CheckCircle2, TriangleAlert } from "lucide-react";

type ActionFeedbackProps = {
  ok?: boolean;
  message?: string;
};

export function ActionFeedback({ ok, message }: ActionFeedbackProps) {
  if (!message) {
    return null;
  }

  const Icon = ok ? CheckCircle2 : TriangleAlert;

  return (
    <div
      className={
        ok
          ? "flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          : "flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
      }
      role="status"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
