import { NotifyOwnerEmail } from "@/components/emails/notify-owner-email";
import { env } from "@/env";
import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";



export async function POST() {
  if (env.NODE_ENV === "production") {
    return NextResponse.json(
      { message: "Not allowed in prod" },
      { status: 405 }
    );
  }
  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["mucus.hooide@gmail.com"],
      subject: "Hello world",
      react: NotifyOwnerEmail(),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
