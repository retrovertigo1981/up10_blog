import {
  SiFacebook,
  SiInstagram,
  SiTiktok,
  SiYoutube,
} from "@icons-pack/react-simple-icons";

import { cn } from "~/lib/cn";

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/up10.cl/", Icon: SiInstagram },
  { label: "TikTok", href: "https://www.tiktok.com/@up10.cl", Icon: SiTiktok },
  { label: "Facebook", href: "https://www.facebook.com/up10.cl", Icon: SiFacebook },
  { label: "YouTube", href: "https://www.youtube.com/@up10", Icon: SiYoutube },
] as const;

export function SocialLinks({
  className,
  label = "Redes sociales",
  iconSize = 18,
}: {
  className?: string;
  label?: string;
  iconSize?: number;
}) {
  return (
    <ul aria-label={label} className={cn("flex flex-wrap items-center gap-1", className)}>
      {socialLinks.map(({ label: name, href, Icon }) => (
        <li key={href}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={name}
            className="text-wine/70 hover:text-wine hover:bg-wine/10 rounded-button flex size-10 items-center justify-center transition-colors"
          >
            <Icon size={iconSize} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
