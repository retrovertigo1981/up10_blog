export const institutionalPages = {
  nosotros: {
    title: "Nosotros",
    description: "Quiénes somos, nuestra historia y nuestros proyectos.",
  },
  unplugged: {
    title: "UP10 Unplugged",
    description: "Sesiones íntimas con artistas de la escena chilena.",
  },
  podcast: {
    title: "UP10 Podcast",
    description: "Conversaciones sobre música, creatividad e industria.",
  },
  awards: {
    title: "UP10 Awards",
    description: "10 categorías, 10 nominados.",
  },
  contacto: {
    title: "Contacto",
    description: "Escríbenos a prensa@up10.cl o por WhatsApp.",
  },
  privacidad: {
    title: "Política de privacidad",
    description: "Tratamiento de datos personales conforme a la Ley 21.719.",
  },
  terminos: {
    title: "Términos de uso",
    description: "Condiciones de uso del sitio UP10.CL.",
  },
} as const;

export type InstitutionalSlug = keyof typeof institutionalPages;

export function institutionalPage(slug: string) {
  return institutionalPages[slug as InstitutionalSlug] ?? { title: slug, description: "" };
}
