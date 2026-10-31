"use client";

import { useRouter } from "next/navigation";

import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { Button } from "@/components/commons/button/button";
import { SharedDocumentSheet } from "@/components/dashboard/shared-document-sheet/shared-document-sheet";
import {
  useSharedDocumentQuery,
  useSignSharedDocumentMutation,
} from "@/hooks/queries/use-shared-documents";
import { useAuthStore } from "@/stores/auth-store";
import { useToastStore } from "@/stores/toast-store";

export interface SharedDocumentViewProps {
  /** The shared document's ID, from the route. */
  id: string;
}

/**
 * Loads one shared document and works out whether the signed-in user is its
 * owner (read-only) or a recipient (can sign), then hands over to the sheet.
 */
export const SharedDocumentView = ({ id }: SharedDocumentViewProps) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data: document, error, isPending } = useSharedDocumentQuery(id);
  const {
    error: signError,
    isPending: isSigning,
    mutate: sign,
  } = useSignSharedDocumentMutation();
  const showToast = useToastStore((state) => state.showToast);

  if (isPending) {
    return (
      <div
        aria-hidden
        className="mx-auto h-96 w-full max-w-3xl animate-pulse rounded-box bg-base-200"
      >
        <LoadingStatus message="Loading shared document" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="mx-auto grid w-full max-w-3xl place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-12 text-center">
        <p className="font-title text-base font-bold text-nox-noir">
          Document not found
        </p>
        <p className="mt-1 max-w-sm text-sm text-nox-noir/60">
          {error?.message ??
            "This shared document doesn't exist or isn't shared with you."}
        </p>
        <Button
          className="mt-4"
          onClick={() => router.push("/my-documents")}
          size="sm"
          variant="outline"
        >
          Back to My Documents
        </Button>
      </div>
    );
  }

  return (
    <SharedDocumentSheet
      document={document}
      errorMessage={signError?.message}
      isSigning={isSigning}
      onSign={(signature) =>
        sign(
          { id, signature },
          {
            onSuccess: () =>
              showToast({
                message: "Document signed and locked.",
                tone: "success",
              }),
          },
        )
      }
      viewer={user?.uid === document.ownerId ? "owner" : "recipient"}
    />
  );
};
