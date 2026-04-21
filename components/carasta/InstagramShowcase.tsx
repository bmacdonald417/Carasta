"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Heart, ExternalLink } from "lucide-react";

const INSTAGRAM_HANDLE = "car.asta";
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

// Mock data — Carasta-branded placeholder assets (fallback when API unavailable)
const MOCK_POSTS = [
  {
    id: "1",
    mediaUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600",
    mediaType: "image",
    likes: 1247,
    permalink: INSTAGRAM_URL,
  },
  {
    id: "2",
    mediaUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600",
    mediaType: "image",
    likes: 892,
    permalink: INSTAGRAM_URL,
  },
  {
    id: "3",
    mediaUrl: "https://images.unsplash.com/photo-1584345604476-8ec50c0d4c8d?w=600",
    mediaType: "image",
    likes: 2103,
    permalink: INSTAGRAM_URL,
  },
  {
    id: "4",
    mediaUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600",
    mediaType: "image",
    likes: 1567,
    permalink: INSTAGRAM_URL,
  },
  {
    id: "5",
    mediaUrl: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600",
    mediaType: "image",
    likes: 734,
    permalink: INSTAGRAM_URL,
  },
  {
    id: "6",
    mediaUrl: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600",
    mediaType: "image",
    likes: 1892,
    permalink: INSTAGRAM_URL,
  },
  {
    id: "7",
    mediaUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600",
    mediaType: "image",
    likes: 445,
    permalink: INSTAGRAM_URL,
  },
  {
    id: "8",
    mediaUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600",
    mediaType: "image",
    likes: 1123,
    permalink: INSTAGRAM_URL,
  },
  {
    id: "9",
    mediaUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600",
    mediaType: "image",
    likes: 987,
    permalink: INSTAGRAM_URL,
  },
  {
    id: "10",
    mediaUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600",
    mediaType: "image",
    likes: 2134,
    permalink: INSTAGRAM_URL,
  },
  {
    id: "11",
    mediaUrl: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=600",
    mediaType: "image",
    likes: 654,
    permalink: INSTAGRAM_URL,
  },
  {
    id: "12",
    mediaUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600",
    mediaType: "image",
    likes: 3421,
    permalink: INSTAGRAM_URL,
  },
];

type Post = (typeof MOCK_POSTS)[number];

const SCROLL_SPEED = 0.15;
const SCROLL_SPEED_HOVER = 0.04;
const CARD_GAP = 16;
const CARD_WIDTH = 200;
const CARD_ASPECT = 1;

export function InstagramShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number>();

  const singleRowWidth =
    MOCK_POSTS.length * (CARD_WIDTH + CARD_GAP) - CARD_GAP;
  const totalWidth = singleRowWidth * 2;

  const animate = useCallback(() => {
    const speed = isHovered ? SCROLL_SPEED_HOVER : SCROLL_SPEED;
    scrollPosRef.current += speed;
    if (scrollPosRef.current >= singleRowWidth) scrollPosRef.current -= singleRowWidth;
    if (scrollPosRef.current < 0) scrollPosRef.current += singleRowWidth;
    if (scrollRef.current) {
      scrollRef.current.style.transform = `translateX(-${scrollPosRef.current}px)`;
    }
    rafRef.current = requestAnimationFrame(animate);
  }, [isHovered, singleRowWidth]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  function scroll(direction: "left" | "right") {
    const delta = direction === "left" ? -120 : 120;
    scrollPosRef.current += delta;
    if (scrollPosRef.current < 0) scrollPosRef.current += singleRowWidth;
    if (scrollPosRef.current >= singleRowWidth) scrollPosRef.current -= singleRowWidth;
    scrollPosRef.current = Math.max(0, Math.min(singleRowWidth, scrollPosRef.current));
    if (scrollRef.current) {
      scrollRef.current.style.transform = `translateX(-${scrollPosRef.current}px)`;
    }
  }

  return (
    <section className="border-t border-white/10 bg-[#0a0a0f]/95 py-16 md:py-24">
      <div className="carasta-container">
        <div className="flex flex-col items-center gap-2 md:flex-row md:justify-between md:items-end">
          <div>
            <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.2em] text-foreground md:text-3xl">
              Follow @{INSTAGRAM_HANDLE.toUpperCase()}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Social Command Center — latest from the Carmunity
            </p>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 rounded-lg border border-[#ff3b5c]/30 bg-[#ff3b5c]/10 px-4 py-2.5 text-sm font-medium text-[#ff3b5c] transition hover:bg-[#ff3b5c]/20 md:mt-0"
          >
            View on Instagram
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <div
          className="relative mt-8 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Manual controls */}
          <div className="absolute left-0 top-0 z-10 flex h-full items-center pl-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 backdrop-blur-sm text-neutral-300 transition hover:border-[#ff3b5c]/50 hover:bg-black/80 hover:text-white md:h-14 md:w-14"
              aria-label="Scroll backward"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
          <div className="absolute right-0 top-0 z-10 flex h-full items-center pr-2">
            <button
              type="button"
              onClick={() => scroll("right")}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 backdrop-blur-sm text-neutral-300 transition hover:border-[#ff3b5c]/50 hover:bg-black/80 hover:text-white md:h-14 md:w-14"
              aria-label="Scroll forward"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          {/* Kinetic carousel track */}
          <div
            ref={scrollRef}
            className="flex gap-4 will-change-transform"
            style={{
              width: totalWidth,
            }}
          >
            {[...MOCK_POSTS, ...MOCK_POSTS].map((post) => (
              <MediaCard key={`${post.id}-${post.mediaUrl}`} post={post} />
            ))}
          </div>

          {/* Scanline overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.03) 2px,
                rgba(255,255,255,0.03) 4px
              )`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

function MediaCard({ post }: { post: Post }) {
  const [hovered, setHovered] = useState(false);


  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-all duration-300 hover:border-[#ff3b5c]/30 hover:shadow-[0_0_20px_rgba(255,59,92,0.15)]"
      style={{ width: CARD_WIDTH, aspectRatio: CARD_ASPECT }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={post.mediaUrl}
        alt=""
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Video play overlay */}
      {post.mediaType === "video" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
            <Play className="h-8 w-8 fill-white text-white" />
          </div>
        </div>
      )}

      {/* Hover overlay with metadata */}
      <div
        className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center gap-2 text-white">
          <Heart className="h-4 w-4 fill-current" />
          <span className="text-sm font-medium">{post.likes.toLocaleString()}</span>
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#ff3b5c]/90 px-2.5 py-1.5 text-xs font-medium text-white">
            View on Instagram
            <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>
    </a>
  );
}
