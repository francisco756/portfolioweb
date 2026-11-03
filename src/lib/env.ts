export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Phones and small tablets get the simplified globe and a plain vertical journey. */
export const isCompact = () => window.matchMedia('(max-width: 860px)').matches

export const hasFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
