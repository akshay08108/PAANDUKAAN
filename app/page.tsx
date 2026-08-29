import Image from "next/image";
import Link from "next/link";
import { Catalog } from "@/components/catalog";
import { Icon } from "@/components/icons";

const steps = [
  ["calendar", "Choose a pickup time", "Pick the day and time that works for you."],
  ["leaf", "Made close to pickup", "Your paan is prepared fresh near your selected time."],
  ["shop", "Collect from the shop", "Visit the shop and collect your order at pickup time."],
] as const;

export default function HomePage() {
  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy"><h1>Freshly made.<br/>Ready when <em>you are.</em></h1><p>Order from trusted paan shops near you. Fresh ingredients, made by experts, ready at your chosen pickup time.</p><form action="/shop" className="hero-search"><Icon name="pin"/><input name="q" placeholder="Search by area, shop or paan item" aria-label="Search shops and items"/><button aria-label="Search"><Icon name="search"/></button></form><Link className="button button-accent" href="/shop">Browse shops <Icon name="arrow"/></Link></div>
      <div className="hero-art"><Image src="/paan-hero.png" alt="Fresh betel leaves and traditional paan ingredients" fill priority sizes="(max-width: 900px) 100vw, 55vw"/></div>
    </div></section>
    <section className="home-catalog container"><Catalog compact/></section>
    <section className="pickup-band"><div className="container"><h2>Pickup only. Fresh by choice.</h2><div className="pickup-steps">{steps.map(([icon, title, copy], index) => <article key={title}><span className="step-icon"><Icon name={icon}/></span><b>{index + 1}</b><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>
  </>;
}
