"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePoll() {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (value: string, index: number) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const handleSubmit = async () => {
    if (!question.trim()) return alert("Enter a question");
    if (options.some(opt => !opt.trim())) return alert("Fill all options");

    setLoading(true);

    const res = await fetch("/api/create-poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, options }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push(`/poll/${data.pollId}`);
    } else {
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Create Poll</h2>

        <input
          type="text"
          placeholder="Enter your question"
          className="w-full border p-2 rounded mb-4 text-black placeholder-gray-500"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        {options.map((option, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            className="w-full border p-2 rounded mb-3 text-black"

            value={option}
            onChange={(e) =>
              handleOptionChange(e.target.value, index)
            }
          />
        ))}

        <button
          onClick={addOption}
          className="w-full border p-2 rounded mb-4 text-black"

        >
          + Add Option
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          {loading ? "Creating..." : "Create Poll"}
        </button>
      </div>
    </main>
  );
}
