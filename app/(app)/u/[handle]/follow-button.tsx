"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useGuestGate } from "@/components/guest-gate/GuestGateProvider";
import { LoadingButton } from "@/components/ui/loading-button";

export function FollowButton({
  targetUserId,
  initialFollowing,
  className,
}: {
  targetUserId: string;
  initialFollowing: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { openGate } = useGuestGate();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  async function toggle() {
    if (!session?.user) {
      openGate({ intent: "follow" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user/follow", {
        method: following ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });
      if (!res.ok) return;
      setFollowing(!following);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoadingButton
      variant={following ? "secondary" : "default"}
      size="sm"
      onClick={toggle}
      loading={loading}
      loadingLabel={following ? "Updating…" : "Following…"}
      className={className}
    >
      {following ? "Following" : "Follow"}
    </LoadingButton>
  );
}
