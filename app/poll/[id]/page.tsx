"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import Turnstile from "react-turnstile";

export default function PollPage() {
  const params = useParams();
  const router = useRouter();
  const pollId = params.id as string;

  const [poll, setPoll] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voterId, setVoterId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, number>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Generate voter ID
  useEffect(() => {
    let existingId = localStorage.getItem("voter_id");

    if (!existingId) {
      existingId = uuidv4();
      localStorage.setItem("voter_id", existingId);
    }

    setVoterId(existingId);
  }, []);

  // Fetch poll + options
  useEffect(() => {
    if (!pollId) return;

    const fetchPoll = async () => {
      const { data: pollData } = await supabase
        .from("polls")
        .select("*")
        .eq("id", pollId)
        .single();

      const { data: optionsData } = await supabase
        .from("options")
        .select("*")
        .eq("poll_id", pollId);

      setPoll(pollData);
      setOptions(optionsData || []);
      fetchResults();
    };

    fetchPoll();
  }, [pollId]);

  // Fetch results
  const fetchResults = async () => {
    const { data } = await supabase
      .from("votes")
      .select("option_id")
      .eq("poll_id", pollId);

    if (!data) return;

    const counts: Record<string, number> = {};

    data.forEach((vote) => {
      counts[vote.option_id] = (counts[vote.option_id] || 0) + 1;
    });

    setResults(counts);
  };

  // Check if already voted
  const checkIfVoted = async (id: string) => {
    const { data } = await supabase
      .from("votes")
      .select("*")
      .eq("poll_id", pollId)
      .eq("voter_id", id)
      .maybeSingle();

    if (data) {
      setHasVoted(true);
      fetchResults();
    }
  };

  useEffect(() => {
    if (voterId && pollId) {
      checkIfVoted(voterId);
    }
  }, [voterId, pollId]);

  // Realtime
  useEffect(() => {
    if (!pollId) return;

    const channel = supabase
      .channel(`realtime-votes-${pollId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${pollId}`,
        },
        () => {
          fetchResults();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId]);

  const handleVote = async () => {
    if (!selectedOption || !voterId || !captchaToken) return;

    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pollId,
        optionId: selectedOption,
        voterId,
        captchaToken,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error submitting vote");
      return;
    }

    setHasVoted(true);
    fetchResults();
  };

  if (!poll) {
    return <div className="p-10 text-black">Loading...</div>;
  }

  const totalVotes = Object.values(results).reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl text-black">

        <h2 className="text-2xl font-bold mb-6 text-center">
          {poll.question}
        </h2>

        {!hasVoted ? (
          <>
            {options.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full border p-3 rounded mb-3 cursor-pointer transition
                  ${
                    selectedOption === option.id
                      ? "bg-black text-white"
                      : "bg-white hover:bg-gray-50"
                  }`}
              >
                {option.text}
              </div>
            ))}

            {/* CAPTCHA */}
            <div className="my-4 flex justify-center">
              <Turnstile
                sitekey={
                  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!
                }
                onVerify={(token) => setCaptchaToken(token)}
              />
            </div>

            <button
              onClick={handleVote}
              disabled={!selectedOption || !captchaToken}
              className="w-full bg-black text-white py-2 rounded mt-2 mb-3 disabled:opacity-40"
            >
              Submit Vote
            </button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-5 text-center">
              Results
            </h3>

            {options.map((option) => {
              const voteCount = results[option.id] || 0;
              const percentage =
                totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

              return (
                <div key={option.id} className="mb-5">

                  <div className="flex items-center mb-2">
                    <div className="flex-1 font-medium">
                      {option.text}
                    </div>

                    <div className="ml-6 text-sm text-gray-600 min-w-[120px] text-right">
                      {voteCount}{" "}
                      {voteCount === 1 ? "vote" : "votes"}
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 h-3 rounded">
                    <div
                      className="bg-black h-3 rounded transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                </div>
              );
            })}
          </>
        )}

        <button
          onClick={() => router.push("/create")}
          className="w-full border py-2 rounded mt-4"
        >
          Create New Poll
        </button>

      </div>
    </main>
  );
}
