import { PiArticle, PiPlus } from "react-icons/pi";
import { ArticleDeleteButton } from "@/components/admin/websites/article-delete-button";
import { ArticleDialog, type ArticleItem } from "@/components/admin/websites/article-dialog";
import { WordPressSyncButton } from "@/components/admin/websites/wordpress-sync-button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { articleStatusLabels, dataSourceLabels, uiText } from "@/lib/labels";
import { articleStatusTone } from "@/lib/status-tones";

type ArticleListProps = {
  websiteId: string;
  articles: ArticleItem[];
  canSyncWordPress: boolean;
  className?: string;
};

export function ArticleList({ websiteId, articles, canSyncWordPress, className }: ArticleListProps) {
  const publishedCount = articles.filter((article) => article.status === "PUBLISHED").length;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1.5">
          <CardTitle>Artikel</CardTitle>
          <CardDescription>
            {articles.length} artikel, {publishedCount} sudah terbit
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {canSyncWordPress && <WordPressSyncButton websiteId={websiteId} />}
          <ArticleDialog
            websiteId={websiteId}
            trigger={
              <Button size="sm">
                <PiPlus />
                Tambah artikel
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent className={articles.length > 0 ? "px-0" : undefined}>
        {articles.length === 0 ? (
          <EmptyState
            icon={PiArticle}
            title="Belum ada artikel"
            description="Klik 'Tambah artikel' untuk mencatat artikel yang sudah terbit di website ini."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Judul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal terbit</TableHead>
                <TableHead>Sumber</TableHead>
                <TableHead className="pr-5 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="max-w-md min-w-56 pl-5 whitespace-normal">
                    {article.url ? (
                      <a href={article.url} target="_blank" rel="noreferrer" className="hover:text-primary hover:underline">
                        {article.title}
                      </a>
                    ) : (
                      article.title
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={articleStatusTone[article.status]}>{articleStatusLabels[article.status]}</StatusBadge>
                  </TableCell>
                  <TableCell>{article.publishedAt ? formatDate(article.publishedAt) : "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{dataSourceLabels[article.source]}</TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="flex justify-end gap-1">
                      <ArticleDialog
                        websiteId={websiteId}
                        article={article}
                        trigger={
                          <Button variant="ghost" size="sm">
                            {uiText.edit}
                          </Button>
                        }
                      />
                      <ArticleDeleteButton articleId={article.id} title={article.title} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
