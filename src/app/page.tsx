'use client';

import { useHello } from '@/src/lib/hooks/use-hello';
import { useCounterStore } from '@/src/store/counter-store';
import { HelloWorld } from '@/src/components/hello-world';

export default function HomePage() {
  const { message } = useHello();
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <HelloWorld />

      <p className="text-muted-foreground text-sm">{message}</p>

      <div className="flex flex-col items-center gap-3">
        <span className="text-4xl font-bold">{count}</span>
        <div className="flex gap-2">
          <button
            onClick={decrement}
            className="hover:bg-accent rounded-md border px-4 py-2 text-sm"
          >
            −
          </button>
          <button
            onClick={increment}
            className="hover:bg-accent rounded-md border px-4 py-2 text-sm"
          >
            +
          </button>
          <button onClick={reset} className="hover:bg-accent rounded-md border px-4 py-2 text-sm">
            Reset
          </button>
        </div>
      </div>
    </main>
  );
}
