import { Link } from "react-router";
import type { Route } from "./+types/not-found";

export const meta: Route.MetaFunction = () => [
  { title: "Página no encontrada — UP10" },
  { name: "robots", content: "noindex" },
];

export default function NotFound() {
  return (
    <section className="container-up10 flex min-h-[60vh] flex-col justify-center py-24">
      <p className="font-heading text-wine text-8xl">404</p>
      <h1 className="mt-4 text-3xl">No encontramos esta página</h1>
      <p className="text-ink/70 mt-3 max-w-md">
        Puede que el enlace haya cambiado. Revisa la portada o usa el buscador.
      </p>
      <Link to="/" className="bg-wine text-cream rounded-button mt-8 w-fit px-6 py-3 font-semibold">
        Volver a la portada
      </Link>
    </section>
  );
}
