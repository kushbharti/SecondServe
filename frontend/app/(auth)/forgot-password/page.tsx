'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Enter the email you used to sign up. In this demo, we&apos;ll simulate a
        reset email being sent—no real emails are delivered.
      </p>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-xs font-medium text-muted-foreground"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="focus-visible-ring block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm"
          placeholder="you@example.org"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="focus-visible-ring inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Sending link…' : 'Send reset link'}
      </button>
      {submitted && (
        <p className="text-[11px] text-success">
          If this were connected to a backend, you&apos;d now receive a password
          reset email. For the demo, you can simply go back and log in with
          mock credentials.
        </p>
      )}
    </form>
  );
}

