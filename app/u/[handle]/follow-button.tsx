"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser } from "@/app/u/[handle]/actions";

export function FollowButton({
  targetUserId,
  initialFollowing,
  className,
}: {
  targetUserId: string;
  initialFollowing: boolean;
  className?: string;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    if (following) {
      const result = await unfollowUser(targetUserId);
      if (result.ok) setFollowing(false);
    } else {
      const result = await followUser(targetUserId);
      if (result.ok) setFollowing(true);
    }
    setLoading(false);
  }

  return (
    <Button
      variant={following ? "secondary" : "performance"}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={className}
    >
      {following ? "Unfollow" : "Follow"}
    </Button>
  );
}
