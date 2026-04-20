"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  async function toggle() {
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
    <Button
      variant={following ? "secondary" : "default"}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={className}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
