import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";



export async function POST(req: Request) {
  try {
    const { question, options } = await req.json();

    if (!question || options.length < 2) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    // Insert poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({ question })
      .select()
      .single();

    if (pollError) throw pollError;

    // Insert options
    const optionsData = options.map((text: string) => ({
      poll_id: poll.id,
      text,
    }));

    const { error: optionsError } = await supabase
      .from("options")
      .insert(optionsData);

    if (optionsError) throw optionsError;

    return NextResponse.json({ pollId: poll.id });

  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
