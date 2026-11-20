import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";

import { Button } from "./button";

type State = "idle" | "sending" | "success" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!email.includes("@")) {
      setState("error");
      setMessage("Ingresa un correo válido.");
      return;
    }

    if (!consent) {
      setState("error");
      setMessage("Necesitamos tu consentimiento para enviarte el boletín.");
      return;
    }

    setState("sending");

    // Placeholder hasta conectar el endpoint /newsletter de WordPress.
    await new Promise((resolve) => setTimeout(resolve, 600));

    setState("success");
    setMessage("Revisa tu correo para confirmar la suscripción.");
    setEmail("");
    setConsent(false);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Correo electrónico
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="TU EMAIL"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (state === "error") setState("idle");
            }}
            aria-invalid={state === "error" || undefined}
            aria-describedby="newsletter-help"
            className="bg-ink text-cream placeholder:text-cream/60 rounded-button focus-visible:outline-wine h-12 w-full px-5 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={state === "sending"}
          className="sm:w-auto"
        >
          {state === "sending" ? "Enviando…" : "Unirme"}
        </Button>
      </div>

      <label className="text-ink/70 mt-4 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="accent-wine mt-0.5 size-4"
          required
        />
        <span>
          Acepto recibir el boletín y he leído la{" "}
          <Link to="/privacidad" className="underline underline-offset-2">
            política de privacidad
          </Link>
          .
        </span>
      </label>

      <p
        id="newsletter-help"
        role={state === "error" ? "alert" : "status"}
        className="mt-3 min-h-5 text-sm"
      >
        {message}
      </p>
    </form>
  );
}
