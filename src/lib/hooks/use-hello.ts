'use client';

import { useState } from 'react';

export function useHello() {
  const [message] = useState('Hello from a custom hook!');

  return { message };
}
