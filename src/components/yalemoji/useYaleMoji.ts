"use client";

import { useEffect, useState } from "react";
import { subscribeYaleMoji, subscribeYaleMojiBanner } from "@/lib/yalemojiCache";
import type { YaleMojiAvatar } from "@/lib/yalemojiTypes";

export function useYaleMoji(netid: string | undefined) {
  const [avatar, setAvatar] = useState<YaleMojiAvatar | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (!netid) {
      setAvatar(null);
      setShowPrompt(false);
      setBroken(false);
      return;
    }

    const unsubscribeAvatar = subscribeYaleMoji(netid, (next) => {
      setBroken(false);
      setAvatar(next);
    });
    const unsubscribePrompt = subscribeYaleMojiBanner(netid, setShowPrompt);
    return () => {
      unsubscribeAvatar();
      unsubscribePrompt();
    };
  }, [netid]);

  return {
    avatar: broken ? null : avatar,
    showPrompt,
    hideAvatar: () => setBroken(true),
  };
}
