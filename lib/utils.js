// Minimal utility for shadcn/ui compatibility
export function cn(...args) {
  return args.filter(Boolean).join(' ');
}
