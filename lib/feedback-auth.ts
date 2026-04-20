import { getSession } from "@/lib/auth";
import { getFeedbackOrganizationId } from "@/lib/feedback-org";

export class FeedbackAuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "FeedbackAuthError";
    this.status = status;
  }
}

/**
 * Kit expects an organization UUID; Carasta stores a stable string (default `carasta`).
 */
export async function requireOrg(): Promise<string> {
  const session = await getSession();
  if (!session?.user) {
    throw new FeedbackAuthError("Unauthorized: sign in required", 401);
  }
  return getFeedbackOrganizationId();
}

/** Signed-in actor for POST /api/feedback (user id + single-tenant org id). */
export async function requireFeedbackActor(): Promise<{
  userId: string;
  organizationId: string;
}> {
  const session = await getSession();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) {
    throw new FeedbackAuthError("Unauthorized: sign in required", 401);
  }
  return { userId: id, organizationId: getFeedbackOrganizationId() };
}

export type FeedbackSessionUser = {
  id: string;
  organizationId: string;
  role?: string;
  email?: string | null;
  name?: string | null;
};

/**
 * Adapts NextAuth session to the kit's role gate. Carasta has `Role.ADMIN` / `Role.USER` only;
 * kit "Admin" | "Compliance" both map to platform admins (`ADMIN`).
 */
export async function requireRole(
  roles: string[]
): Promise<FeedbackSessionUser> {
  const session = await getSession();
  const user = session?.user as FeedbackSessionUser | undefined;
  if (!user?.id) {
    throw new FeedbackAuthError("Unauthorized", 401);
  }

  const wantsElevated = roles.some(
    (r) => r === "Admin" || r === "Compliance" || r === "ADMIN"
  );
  const role = (user as { role?: string }).role;
  const isAdmin = role === "ADMIN";

  if (wantsElevated && !isAdmin) {
    throw new FeedbackAuthError("Forbidden: admin role required", 403);
  }

  return {
    ...user,
    organizationId: getFeedbackOrganizationId(),
  };
}
