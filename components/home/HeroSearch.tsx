"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NIGERIAN_STATES = [
  "Lagos", "Abuja", "Kano", "Rivers", "Oyo", 
  "Anambra", "Enugu", "Edo", "Kaduna", "Delta"
];

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [state, setState] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (state) params.append("state", state);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="flex flex-col md:flex-row gap-3 w-full max-w-4xl mx-auto bg-white p-3 md:rounded-full rounded-2xl shadow-[var(--shadow-sm)]"
    >
      <div className="flex-1 flex items-center px-4 md:border-r border-[hsl(var(--muted))]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          placeholder="What are you looking for?" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 font-sans"
        />
      </div>
      
      <div className="flex-1 flex items-center px-4 md:border-r border-[hsl(var(--muted))]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <select 
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-gray-800 appearance-none cursor-pointer font-sans"
        >
          <option value="">All Nigeria</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <button 
        type="submit"
        className="w-full md:w-auto px-8 py-3 bg-[hsl(var(--color-primary))] hover:brightness-110 text-white font-semibold rounded-xl md:rounded-full transition-all duration-200"
      >
        Search
      </button>
    </form>
  );
}
