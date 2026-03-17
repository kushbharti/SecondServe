'use client';

import { useState } from 'react';

export default function VerifyPhonePage() {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert(
        'Phone verification will be connected to the mock auth flow. For now, any 6-digit code is accepted in the demo.'
      );
    }, 500);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-muted-foreground">
        We&apos;ve sent a 6-digit verification code to your phone (simulated in
        this demo). Enter <span className="font-semibold">123456</span> to
        continue.
      </p>
      <div className="space-y-2">
        <label
          htmlFor="code"
          className="block text-xs font-medium text-muted-foreground"
        >
          Verification code
        </label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          pattern="^\d{6}$"
          maxLength={6}
          required
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="focus-visible-ring block w-full rounded-lg border border-input bg-background px-3 py-2 text-center text-lg tracking-[0.4em]"
          placeholder="••••••"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || code.length !== 6}
        className="focus-visible-ring inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Verifying…' : 'Verify phone'}
      </button>
      <p className="text-[11px] text-muted-foreground">
        In this MVP, phone verification is entirely simulated on the frontend.
        No SMS messages are sent and no personal data is stored.
      </p>
    </form>
  );
}

