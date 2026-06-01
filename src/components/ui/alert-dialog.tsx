"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AlertDialog = Dialog;
const AlertDialogTrigger = DialogTrigger;
const AlertDialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;

function AlertDialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent showCloseButton={false} className={cn("max-w-md", className)} {...props}>
      {children}
    </DialogContent>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <DialogHeader className={cn("text-left", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <DialogFooter className={cn("", className)} {...props} />;
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle className={cn("", className)} {...props} />;
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription className={cn("", className)} {...props} />;
}

function AlertDialogAction({ className, onClick, children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <DialogClose
      render={
        <Button className={cn("", className)} onClick={onClick} {...props}>
          {children}
        </Button>
      }
    />
  );
}

function AlertDialogCancel({ className, children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <DialogClose
      render={
        <Button variant="outline" className={cn("", className)} {...props}>
          {children}
        </Button>
      }
    />
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
