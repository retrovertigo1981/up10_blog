import { SiWhatsapp, SiX } from "@icons-pack/react-simple-icons";
import { Check, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "./ui/button";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Sin permisos de portapapeles no hay mucho más que ofrecer.
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return;
      }
    }

    await copyLink();
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="secondary" size="sm" onClick={handleShare}>
        {copied ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Share2 className="size-4" aria-hidden="true" />
        )}
        {copied ? "Enlace copiado" : "Compartir"}
      </Button>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Compartir en X"
        className="text-wine/70 hover:text-wine hover:bg-wine/10 rounded-button flex size-9 items-center justify-center transition-colors"
      >
        <SiX size={16} aria-hidden="true" />
      </a>

      <a
        href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Compartir en WhatsApp"
        className="text-wine/70 hover:text-wine hover:bg-wine/10 rounded-button flex size-9 items-center justify-center transition-colors"
      >
        <SiWhatsapp size={16} aria-hidden="true" />
      </a>
    </div>
  );
}
