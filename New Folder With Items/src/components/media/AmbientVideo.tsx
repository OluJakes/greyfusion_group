/**
 * Muted ambient background loop. Server component — pure markup, zero JS cost.
 * Autoplay-safe (muted + playsInline); poster carries the frame if the stream
 * is unavailable, and the parent's gradient carries it if both fail.
 */
export function AmbientVideo({
  src,
  poster,
  className = "",
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster={poster}
      aria-hidden="true"
      className={
        "absolute inset-0 h-full w-full object-cover pointer-events-none brightness-[0.75] contrast-[1.05] " +
        className
      }
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
