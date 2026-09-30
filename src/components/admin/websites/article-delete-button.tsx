"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import { uiText } from "@/lib/labels";

export function ArticleDeleteButton({ articleId, title }: { articleId: string; title: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const result = await apiRequest(`/api/articles/${articleId}`, { method: "DELETE" });
    if (result.error) {
      toast.error(result.error.message);
      return false;
    }
    toast.success("Artikel berhasil dihapus.");
    router.refresh();
  };

  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="sm" className="text-danger hover:text-danger">
          {uiText.delete}
        </Button>
      }
      title="Hapus artikel ini?"
      description={`"${title}" akan dihapus dari daftar artikel website. Tindakan ini tidak bisa dibatalkan.`}
      onConfirm={handleDelete}
    />
  );
}
