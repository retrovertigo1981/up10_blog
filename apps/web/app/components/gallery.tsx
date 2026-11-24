/* El clic en el backdrop del diálogo cierra la galería; Esc también funciona
   de forma nativa. */
/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */

import type { Image as ImageData } from "@up10/api-client";
import { X } from "lucide-react";
import { useRef, useState } from "react";

import { Image } from "./ui/image";

export function Gallery({ images }: { images: ImageData[] }) {
  const [active, setActive] = useState<ImageData | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (images.length === 0) return null;

  function open(image: ImageData) {
    setActive(image);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <li key={`${image.src}-${index}`}>
            <button
              type="button"
              onClick={() => open(image)}
              aria-label={`Ampliar imagen ${index + 1}: ${image.alt}`}
              className="group block w-full"
            >
              <Image
                data={image}
                ratio="4:3"
                imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Galería de imágenes"
        className="gallery-dialog"
        onClose={() => setActive(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        {active ? (
          <div className="relative flex h-full items-center justify-center">
            <img
              src={active.src}
              alt={active.alt}
              width={active.width}
              height={active.height}
              className="rounded-card max-h-[85vh] w-auto max-w-full object-contain"
            />

            <button
              type="button"
              onClick={close}
              aria-label="Cerrar galería"
              className="bg-wine text-cream rounded-button absolute right-4 top-4 flex size-10 items-center justify-center"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
