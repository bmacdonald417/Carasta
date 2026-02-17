import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(1, "Message is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstKey = Object.keys(fieldErrors)[0] as keyof typeof fieldErrors | undefined;
      const first = firstKey ? fieldErrors[firstKey] : undefined;
      const msg = Array.isArray(first) ? first[0] : "Invalid input";
      return NextResponse.json({ message: msg ?? "Invalid input" }, { status: 400 });
    }
    const { firstName, lastName, email, message } = parsed.data;

    // Demo: log to console. Replace with email send (e.g. Resend, SendGrid) or DB store.
    console.log("[Contact]", { firstName, lastName, email, message });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
