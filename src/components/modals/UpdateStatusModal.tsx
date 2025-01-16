import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeamStatus } from "@/api/users";
import { useToast } from "@/hooks/use-toast";

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  currentStatus?: string;
}

export function UpdateStatusModal({
  isOpen,
  onClose,
  email = "",
  currentStatus = "",
}: UpdateStatusModalProps) {
  const [inputEmail, setInputEmail] = useState("");
  const [newStatus, setNewStatus] = useState(currentStatus);
  const { toast } = useToast();

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateTeamStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
      toast({
        title: "Success",
        description: "Team status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update team status",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleStatusUpdate = () => {
    if (inputEmail !== email) {
      toast({
        title: "Error",
        description: "Invalid email address",
        variant: "destructive",
      });
      return;
    }

    if (newStatus.split(" ").length > 20) {
      toast({
        title: "Error",
        description: "Status must be 20 words or less",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      email,
      team_status: newStatus,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Team Status</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email to verify"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="space-y-2">
            <Input
              id="status"
              placeholder="Enter new status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleStatusUpdate} disabled={mutation.isPending}>
            {mutation.isPending ? "Updating..." : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
