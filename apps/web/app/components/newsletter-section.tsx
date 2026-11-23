import { NewsletterForm } from "./ui/newsletter-form";

export function NewsletterSection() {
  return (
    <section id="newsletter" aria-labelledby="newsletter-title" className="py-16 lg:py-24">
      <div className="container-up10">
        <div data-reveal className="mx-auto max-w-3xl text-center">
          <p className="font-heading text-wine text-sm uppercase tracking-[0.12em]">/ Newsletter</p>

          <h2
            id="newsletter-title"
            className="font-heading text-wine mt-3 text-[clamp(2.5rem,6vw,5rem)] font-normal uppercase leading-none"
          >
            Suscríbete al pulso
          </h2>

          <p className="text-ink/70 mx-auto mt-5 max-w-xl text-base leading-relaxed">
            Recibe los estrenos, reportajes y eventos de la escena directamente en tu correo cada
            semana. Sin spam, solo cultura.
          </p>

          <div className="mt-8 text-left">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
