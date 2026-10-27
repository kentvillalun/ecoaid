"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PlayIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";

// The EcoAid explainer, hosted as an unlisted video on the EcoAid YouTube channel
export const HOW_IT_WORKS_VIDEO_ID = "5vb6wDmds-0";
export const HOW_IT_WORKS_VIDEO_LENGTH = "0:54";

export const howItWorksThumbnail = `https://i.ytimg.com/vi/${HOW_IT_WORKS_VIDEO_ID}/hqdefault.jpg`;

// youtube-nocookie and rel=0: no tracking cookies until played, and fewer unrelated videos at the end
const embedUrl = `https://www.youtube-nocookie.com/embed/${HOW_IT_WORKS_VIDEO_ID}?autoplay=1&rel=0&playsinline=1`;

const Player = () => (
  <iframe
    src={embedUrl}
    title="How EcoAid works"
    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
    // YouTube refuses to play embeds that do not send the page's origin (error 153)
    referrerPolicy="strict-origin-when-cross-origin"
    className="w-full h-full border-0"
  />
);

const Thumbnail = ({ onPlay }) => (
  <button
    type="button"
    onClick={onPlay}
    className="relative w-full h-full hover:cursor-pointer group"
    aria-label="Play the How EcoAid works video"
  >
    <Image
      src={howItWorksThumbnail}
      alt="How EcoAid works"
      fill
      sizes="(max-width: 768px) 100vw, 640px"
      className="object-cover"
    />
    <span className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
    <span className="absolute inset-0 flex items-center justify-center">
      <span className="w-14 h-14 rounded-full gradient-button flex items-center justify-center shadow-lg">
        <PlayIcon className="w-6 fill-white ml-0.5" />
      </span>
    </span>
    <span className="absolute bottom-2 right-2 text-xs font-medium text-white bg-black/70 px-1.5 py-0.5 rounded">
      {HOW_IT_WORKS_VIDEO_LENGTH}
    </span>
  </button>
);

// Inline video: shows the thumbnail and only loads YouTube when tapped
export const HowItWorksVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
      {isPlaying ? <Player /> : <Thumbnail onPlay={() => setIsPlaying(true)} />}
    </div>
  );
};

// Full-screen dark overlay that plays the video right away
export const HowItWorksVideoOverlay = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.section
          className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-black/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:cursor-pointer"
            aria-label="Close video"
          >
            <XMarkIcon className="w-6 stroke-white" />
          </button>
          <div
            className="w-full max-w-3xl aspect-video rounded-xl overflow-hidden bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <Player />
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};
