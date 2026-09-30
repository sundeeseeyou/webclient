"use client";

import { useState } from "react";
import { PiPencilSimple } from "react-icons/pi";
import { type ClientOption, ProjectForm } from "@/components/admin/project-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { ProjectInput } from "@/lib/validations/project";

type ProjectEditDialogProps = {
  projectId: string;
  client: ClientOption;
  defaultValues: ProjectInput;
};

export function ProjectEditDialog({ projectId, client, defaultValues }: ProjectEditDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PiPencilSimple />
          Ubah proyek
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ubah proyek</DialogTitle>
          <DialogDescription>Klien pemilik proyek tidak bisa diganti. Status diubah lewat kolom status.</DialogDescription>
        </DialogHeader>
        <ProjectForm
          clients={[client]}
          defaultValues={defaultValues}
          projectId={projectId}
          onSaved={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
