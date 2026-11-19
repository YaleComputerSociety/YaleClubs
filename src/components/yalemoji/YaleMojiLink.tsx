"use client";

import { ComponentProps, useSyncExternalStore } from "react";
import { markYaleMojiVisit } from "@/lib/yalemojiCache";

function subscribeToColorScheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getColorScheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function YaleMojiLink({
  href,
  children,
  onClick,
  onAuxClick,
  ...props
}: Omit<ComponentProps<"a">, "href"> & { href: string }) {
  const mode = useSyncExternalStore(subscribeToColorScheme, getColorScheme, () => "light");
  const url = new URL(href);
  url.searchParams.set("mode", mode);

  return (
    <a
      {...props}
      href={url.toString()}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) markYaleMojiVisit();
      }}
      onAuxClick={(event) => {
        onAuxClick?.(event);
        if (event.button === 1 && !event.defaultPrevented) markYaleMojiVisit();
      }}
    >
      {children}
    </a>
  );
}
