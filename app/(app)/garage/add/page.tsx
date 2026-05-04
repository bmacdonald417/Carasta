import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AddGarageCarForm } from "./add-garage-car-form";

export default async function AddGaragePage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  return (
    <div className="carasta-container max-w-xl py-8">
      <header className="border-b border-border pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Add to Garage</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a car you own to your Carmunity garage.
        </p>
      </header>
      <AddGarageCarForm type="GARAGE" className="mt-6" />
    </div>
  );
}
