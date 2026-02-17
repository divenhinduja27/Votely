import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { pollId, optionId, voterId, captchaToken } =
      await req.json();

    if (!pollId || !optionId || !voterId || !captchaToken) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // 🔥 Verify CAPTCHA with Cloudflare
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${captchaToken}`,
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed" },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for") || "unknown";

    const { error } = await supabase.from("votes").insert({
      poll_id: pollId,
      option_id: optionId,
      voter_id: voterId,
      ip_address: ip,
    });

    if (error) {
      return NextResponse.json(
        { error: "You have already voted" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
