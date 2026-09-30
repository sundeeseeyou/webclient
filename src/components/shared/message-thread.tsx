"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PiPaperPlaneRight } from "react-icons/pi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, setFieldErrors } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";
import type { ThreadMessage } from "@/lib/messages";
import { MESSAGE_MAX_LENGTH, messageSchema } from "@/lib/validations/project";

const POLL_INTERVAL_MS = 15_000;

type MessageThreadProps = {
  projectId: string;
  currentUserId: string;
  initialMessages: ThreadMessage[];
  description: string;
  className?: string;
};

export function MessageThread({ projectId, currentUserId, initialMessages, description, className }: MessageThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const listRef = useRef<HTMLDivElement>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(messageSchema), defaultValues: { body: "" } });
  const body = useWatch({ control, name: "body" });
  const lastMessageId = messages.at(-1)?.id;

  // Tidak realtime (tanpa WebSocket): ambil ulang pesan saat dibuka, tiap 15 detik, dan saat tab browser aktif kembali.
  useEffect(() => {
    const load = async () => {
      if (document.visibilityState !== "visible") return;
      const result = await apiRequest<ThreadMessage[]>(`/api/projects/${projectId}/messages`);
      if (result.data) setMessages(result.data);
    };
    void load();
    const timer = setInterval(() => void load(), POLL_INTERVAL_MS);
    const onVisibilityChange = () => void load();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [projectId]);

  // Gulir ke pesan terbaru hanya saat ada pesan baru, supaya polling tidak mengganggu yang sedang membaca pesan lama.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [lastMessageId]);

  const onSubmit = handleSubmit(async (values) => {
    const result = await apiRequest<ThreadMessage>(`/api/projects/${projectId}/messages`, { method: "POST", body: values });
    if (result.error) {
      setFieldErrors(setError, result.error.fields);
      toast.error(result.error.message);
      return;
    }
    const sent = result.data;
    setMessages((current) => (current.some((message) => message.id === sent.id) ? current : [...current, sent]));
    reset({ body: "" });
  });

  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardHeader className="border-b py-5">
        <CardTitle>Pesan</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <div ref={listRef} className="h-[min(60vh,480px)] overflow-y-auto px-4 py-5 sm:px-5">
        {messages.length === 0 ? (
          <p className="flex h-full items-center justify-center text-center text-muted-foreground">
            Belum ada pesan. Tulis pesan pertama di bawah.
          </p>
        ) : (
          <ul className="space-y-4">
            {messages.map((message) => {
              const isMine = message.sender.id === currentUserId;
              return (
                <li key={message.id} className={cn("flex max-w-[85%] flex-col sm:max-w-[75%]", isMine ? "ml-auto items-end" : "items-start")}>
                  <p className="mb-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{message.sender.name}</span> ·{" "}
                    <time dateTime={message.createdAt}>{formatDateTime(new Date(message.createdAt))}</time>
                  </p>
                  <div
                    className={cn(
                      "rounded-xl px-3.5 py-2.5 wrap-break-word whitespace-pre-line",
                      isMine ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted",
                    )}
                  >
                    {message.body}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <form onSubmit={onSubmit} noValidate className="space-y-2 border-t p-4 sm:p-5">
        <label htmlFor={`message-${projectId}`} className="sr-only">
          Tulis pesan
        </label>
        <Textarea
          id={`message-${projectId}`}
          rows={3}
          placeholder="Tulis pesan..."
          className="max-h-48"
          aria-invalid={Boolean(errors.body)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              void onSubmit();
            }
          }}
          {...register("body")}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          {errors.body ? (
            <p role="alert" className="text-xs text-danger">
              {errors.body.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {body.length}/{MESSAGE_MAX_LENGTH} karakter
              <span className="hidden sm:inline"> · Ctrl + Enter untuk mengirim</span>
            </p>
          )}
          <Button type="submit" disabled={isSubmitting} className="ml-auto">
            <PiPaperPlaneRight />
            {isSubmitting ? "Mengirim..." : "Kirim"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
