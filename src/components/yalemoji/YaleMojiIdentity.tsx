"use client";

import Image from "next/image";
import YaleMojiLink from "@/components/yalemoji/YaleMojiLink";
import { yalemojiBackgroundStyle } from "@/lib/yalemojiCache";
import { YALEMOJI_CREATE_URL, YALEMOJI_EDITOR_URL, type YaleMojiAvatar } from "@/lib/yalemojiTypes";

type YaleMojiIdentityProps = {
  variant: "menu" | "profile";
  avatar: YaleMojiAvatar | null;
  showPrompt: boolean;
  onError?: () => void;
};

export default function YaleMojiIdentity({ variant, avatar, showPrompt, onError }: YaleMojiIdentityProps) {
  if (!avatar && !showPrompt) return null;

  if (variant === "profile" && !avatar && showPrompt) {
    return (
      <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#6497cd] via-[#70b1c6] to-[#73c7c1] text-white">
        <YaleMojiLink
          href={YALEMOJI_CREATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-3 text-sm"
        >
          <span>Your personalized Yale avatar</span>
          <span className="font-bold underline decoration-white/50 underline-offset-[3px]">Make your Yalemoji ↗</span>
        </YaleMojiLink>
      </div>
    );
  }

  const size = variant === "profile" ? 160 : 220;
  const frame =
    variant === "profile"
      ? "relative mt-6 flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl bg-clubBlurple"
      : "relative mb-2 flex min-h-[108px] w-[220px] flex-col items-center justify-center overflow-hidden rounded-lg bg-clubBlurple px-4 py-2 text-white";

  return (
    <div className={frame} style={avatar ? yalemojiBackgroundStyle(avatar.background_url, size) : undefined}>
      {avatar && (
        <YaleMojiLink
          href={YALEMOJI_EDITOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Edit your Yalemoji"
          title="Edit your Yalemoji"
          className="absolute bottom-2.5 right-2.5 grid h-7 w-7 place-items-center"
        >
          <Image src="/icons/yalemoji.svg" alt="" width={20} height={16} unoptimized />
        </YaleMojiLink>
      )}
      {avatar ? (
        <Image
          src={avatar.png_url}
          alt="Your Yalemoji"
          width={variant === "profile" ? 160 : 104}
          height={variant === "profile" ? 160 : 104}
          unoptimized
          className={variant === "profile" ? "h-40 w-40 object-contain" : "h-[104px] w-[104px] object-contain"}
          onError={onError}
        />
      ) : (
        <div className="flex flex-col items-center">
          <p className="mb-2 text-center text-xs font-medium text-white/90">Your personalized Yale avatar</p>
          <YaleMojiLink
            href={YALEMOJI_CREATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white bg-white px-3 py-1.5 text-xs font-semibold text-clubBlurple no-underline transition-colors hover:bg-transparent hover:text-white motion-reduce:transition-none"
          >
            Make your Yalemoji
          </YaleMojiLink>
        </div>
      )}
    </div>
  );
}
