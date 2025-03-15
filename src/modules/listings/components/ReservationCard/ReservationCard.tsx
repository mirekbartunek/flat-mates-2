"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import type { listingReservations, users } from "@/server/db";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ReservationCardProps = InferSelectModel<typeof listingReservations> & {
  user: InferSelectModel<typeof users>;
} & {
  disableActions: boolean;
};

export const ReservationCard = ({
  id,
  createdAt,
  user,
  status,
  message,
  disableActions,
}: ReservationCardProps) => {
  const router = useRouter();

  const [showFullListingModal, setShowFullListingModal] = useState(false);

  const { mutate, isPending } =
    api.listings.resolveReservationRequest.useMutation({
      onSuccess: (res) => {
        toast("Successfully resolved request");
        setShowFullListingModal(res.isListingFull);
        router.refresh();
      },
    });

  return (
    <>
      <Dialog
        open={showFullListingModal}
        onOpenChange={setShowFullListingModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Full capacity reached</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-2">
            <p>
              Congrats! You&#39;ve just filled up your listing! We&#39;ve
              automatically set the listing status as private so you won&#39;t
              get flooded with more applications. Nice job! 🎉. Thank you for
              using Flat Mates!
            </p>
            <p>
              And don&#39;t worry, the listing will remain private, if you ever
              need to republish it again, just set the status as public and you
              are back at it!
            </p>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Yay!
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Card key={id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>Reservation Request</CardTitle>
              <CardDescription>
                Created{" "}
                {formatDistance(new Date(createdAt), new Date(), {
                  addSuffix: true,
                })}
              </CardDescription>
              <CardDescription>
                Created by {user.name} -{" "}
                <a href={`mailto:${user.email}`} className="underline">
                  {user.email}
                </a>
              </CardDescription>
            </div>
            <Badge
              variant={
                status === "accepted"
                  ? "default"
                  : status === "rejected"
                    ? "destructive"
                    : "secondary"
              }
            >
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {message ? (
              <p className="text-muted-foreground">{message}</p>
            ) : null}

            {status === "pending" ? (
              <div className="flex gap-2">
                <Button
                  disabled={isPending ?? disableActions}
                  onClick={() =>
                    mutate({
                      reservationId: id,
                      action: "ACCEPT",
                    })
                  }
                  variant="outline"
                  className="flex items-center gap-2 text-green-600 hover:bg-green-50 hover:text-green-700"
                >
                  <Check className="h-4 w-4" />
                  Accept
                </Button>
                <Button
                  disabled={isPending ?? disableActions}
                  onClick={() =>
                    mutate({
                      reservationId: id,
                      action: "REJECT",
                    })
                  }
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
