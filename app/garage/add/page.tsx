import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AddGarageCarForm } from "./add-garage-car-form";

export default async function AddGaragePage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Add to Garage</h1>
      <p className="mt-1 text-muted-foreground">
        Add a car you own.
      </p>
      <AddGarageCarForm type="GARAGE" className="mt-6" />
    </div>
  );
}
