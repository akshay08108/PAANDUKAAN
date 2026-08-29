import type { SVGProps } from "react";

const paths = {
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  cart: <><path d="M3 4h2l2.3 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H7"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></>,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
  leaf: <><path d="M20 4C11 4 5 8 5 15c0 3 2 5 5 5 7 0 10-8 10-16Z"/><path d="M4 21c4-7 8-10 14-14"/></>,
  shop: <><path d="M4 10v11h16V10M3 10l2-6h14l2 6"/><path d="M3 10a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2M9 21v-5h6v5"/></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  minus: <path d="M6 12h12"/>,
  plus: <path d="M12 6v12M6 12h12"/>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
