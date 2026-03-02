import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Check, X } from "lucide-react";
import { connectionRequestService, type ConnectionRequest } from "@/services/connectionRequestService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ConnectionRequestCardProps {
  request: ConnectionRequest;
  onHandled: () => void;
}

export function ConnectionRequestCard({ request, onHandled }: ConnectionRequestCardProps) {
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const navigate = useNavigate();

  const name = request.requester_name ?? "Unknown";
  const orgName = request.requester_organization_name;
  const orgLogo = request.requester_organization_logo;
  const profileImage = request.requester_profile_image;
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleAccept = async () => {
    setLoading("accept");
    try {
      const { thread_id } = await connectionRequestService.acceptRequest(request.id);
      toast.success("Connected!", { description: "Your chat is now open." });
      onHandled();
      navigate(`/chat/${thread_id}`);
    } catch (err: any) {
      toast.error("Failed to accept", { description: err.message });
    } finally {
      setLoading(null);
    }
  };

  const handleDecline = async () => {
    setLoading("decline");
    try {
      await connectionRequestService.declineRequest(request.id);
      toast.info("Request declined");
      onHandled();
    } catch (err: any) {
      toast.error("Failed to decline", { description: err.message });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={profileImage ?? undefined} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {orgLogo && (
            <Avatar className="absolute -bottom-1 -right-1 w-5 h-5 border-2 border-background">
              <AvatarImage src={orgLogo} />
              <AvatarFallback className="text-[8px]">
                <Building2 className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">{name}</p>
          {orgName && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3" /> {orgName}
            </p>
          )}
          <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
            Wants to connect
          </Badge>
        </div>
      </div>

      {/* Intro note */}
      {request.intro_note && (
        <div className="bg-muted/60 rounded-lg px-3 py-2">
          <p className="text-sm text-foreground/80 italic leading-relaxed">
            "{request.intro_note}"
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-muted-foreground border-border hover:text-destructive hover:border-destructive"
          onClick={handleDecline}
          disabled={loading !== null}
        >
          <X className="w-3.5 h-3.5 mr-1" />
          {loading === "decline" ? "Declining…" : "Decline"}
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-[#F2713B] hover:bg-[#e05a28] text-white"
          onClick={handleAccept}
          disabled={loading !== null}
        >
          <Check className="w-3.5 h-3.5 mr-1" />
          {loading === "accept" ? "Accepting…" : "Accept"}
        </Button>
      </div>
    </div>
  );
}
