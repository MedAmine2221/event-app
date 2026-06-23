/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import {
  getOrCreateAnonymousId,
  hasUserLikedBand,
  hasUserLikedPastry,
  toggleBandLike,
  togglePastryLike,
} from "@/lib/engagement-service";
import { useAppSelector } from "@/store/hooks";

interface LikeButtonProps {
  targetType: "band" | "pastry";
  targetId: string;
  initialLikes: number;
  colors: { primary: string; textLight: string };
}

export const LikeButton = ({ targetType, targetId, initialLikes, colors }: LikeButtonProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const [likes, setLikes] = useState(initialLikes || 0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userKey, setUserKey] = useState<string>("");

  useEffect(() => {
    setUserKey(user?.uid || getOrCreateAnonymousId());
  }, [user]);

  useEffect(() => {
    if (!userKey) return;
    const check = targetType === "band" ? hasUserLikedBand : hasUserLikedPastry;
    check(targetId, userKey).then(setLiked).catch(() => {});
  }, [userKey, targetId, targetType]);

  const handleClick = async () => {
    if (!userKey || loading) return;
    setLoading(true);
    try {
      const toggle = targetType === "band" ? toggleBandLike : togglePastryLike;
      const result = await toggle(targetId, userKey);
      setLiked(result.liked);
      setLikes(result.likes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-all disabled:opacity-60"
      style={{
        background: liked ? `${colors.primary}15` : "transparent",
        color: liked ? colors.primary : colors.textLight,
        border: `1px solid ${liked ? colors.primary : `${colors.textLight}30`}`,
      }}
    >
      <Heart size={13} fill={liked ? colors.primary : "none"} />
      {likes}
    </motion.button>
  );
};