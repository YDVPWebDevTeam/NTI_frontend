'use client';

import { useState } from 'react';

interface SearchFormProps {
  onSearch: (query: string) => void;
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [query, setQuery] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(query);
      }}
      className="flex gap-2"
    >
      <label htmlFor="search-query" className="sr-only">
        Search
      </label>
      <input
        id="search-query"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search…"
        className="focus:ring-ring rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
      />
      <button
        type="submit"
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
}
