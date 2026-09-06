import Image from "next/image";
import Link from "next/link";
import { Catalog } from "@/components/catalog";
import { Icon } from "@/components/icons";

const steps = [
  ["pin", "Find your local favourite", "Explore trusted paan shops around your area."],
  ["calendar", "Choose your pickup time", "Order ahead and pick a time that works for you."],
  ["leaf", "Made fresh for you", "Your paan is prepared close to pickup, not left waiting."],
] as const;

export default function HomePage() {
  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy">
        <p className="hero-location"><Icon name="pin"/> Hyderabad</p>
        <h1>Hyderabad ka<br/><em>apna paan.</em></h1>
        <p>From your neighbourhood classics to something special — discover trusted local paan shops, order ahead and collect it fresh.</p>
        <form action="/shop" className="hero-search"><Icon name="pin"/><input name="q" placeholder="Search area, shop or your favourite paan" aria-label="Search shops and items"/><button aria-label="Search"><Icon name="search"/></button></form>
        <div className="hero-actions"><Link className="button button-accent" href="/shop">Explore near you <Icon name="arrow"/></Link><Link className="button button-outline" href="/orders">My orders</Link></div>
        <p className="hero-note"><Icon name="leaf"/> Freshly prepared · Pickup on your time</p>
      </div>
      <div className="hero-art"><Image src="/paan-hero.png" alt="Fresh betel leaves and traditional paan ingredients" fill priority sizes="(max-width: 900px) 100vw, 55vw"/></div>
    </div></section>
    <section className="home-catalog container"><div className="section-intro"><span>Discover MeraPaan</span><h2>Your favourites, closer than ever.</h2><p>Browse fresh paan from local sellers and order without waiting at the counter.</p></div><Catalog compact/></section>
    <section className="pickup-band"><div className="container"><span className="band-kicker">Simple. Local. Fresh.</span><h2>Order now. Pick up fresh.</h2><div className="pickup-steps">{steps.map(([icon, title, copy], index) => <article key={title}><span className="step-icon"><Icon name={icon}/></span><b>{index + 1}</b><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>
  </>;
}
