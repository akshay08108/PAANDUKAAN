import Image from "next/image";
import Link from "next/link";
import { Catalog } from "@/components/catalog";
import { Icon } from "@/components/icons";
import { StoreDirectory } from "@/components/store-directory";
import { SectionHeading } from "@/components/ui";

const steps = [
  ["search", "Discover nearby", "Find local shops and real, available items."],
  ["calendar", "Schedule pickup", "Choose the day and time that works for you."],
  ["leaf", "Collect it fresh", "Your paan is prepared close to your pickup slot."],
] as const;

const categories = [["Meetha Paan", "Soft, sweet favourites"], ["Sada Paan", "Classic everyday paan"], ["Flavoured Paan", "Fresh modern flavours"], ["Special Paan", "Signature shop creations"]];

export default function HomePage() {
  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy"><span className="hero-kicker"><Icon name="pin"/>Serving Hyderabad</span><h1>Hyderabad ka<br/><em>apna paan.</em></h1><p>Discover trusted neighbourhood paan shops, order exactly what you like, and collect it freshly made at your chosen time.</p><form action="/shop" className="hero-search"><Icon name="search"/><input name="q" placeholder="Search by area, shop or paan" aria-label="Search shops and items"/><button aria-label="Search">Find paan<Icon name="arrow"/></button></form><p className="hero-trust"><Icon name="check"/>Pickup only · Freshly prepared · Pay sellers directly</p></div>
      <div className="hero-art"><Image src="/paan-hero.png" alt="Fresh betel leaves and traditional paan ingredients" fill priority sizes="(max-width: 900px) 100vw, 50vw"/><div className="hero-card"><Icon name="clock"/><span><b>Ready on your time</b>Schedule a pickup slot</span></div></div>
    </div></section>
    <section className="home-section container"><SectionHeading title="Paan shops near you" copy="Real storefronts from across Hyderabad." actionHref="/shop" actionLabel="Explore all"/><StoreDirectory limit={3}/></section>
    <section className="category-band"><div className="container"><SectionHeading title="Browse by what you like" copy="From timeless classics to shop signatures."/><div className="home-categories">{categories.map(([title, copy]) => <Link key={title} href={"/shop?q=" + encodeURIComponent(title)}><span><Icon name="leaf"/></span><h3>{title}</h3><p>{copy}</p><Icon name="arrow"/></Link>)}</div></div></section>
    <section className="home-section container"><SectionHeading title="Popular around Hyderabad" copy="Fresh products currently available from local sellers." actionHref="/shop" actionLabel="See everything"/><Catalog compact/></section>
    <section className="pickup-band"><div className="container"><SectionHeading title="Fresh paan, without the wait" copy="Order ahead in three simple steps."/><div className="pickup-steps">{steps.map(([icon, title, copy], index) => <article key={title}><span className="step-number">0{index + 1}</span><span className="step-icon"><Icon name={icon}/></span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>
    <section className="audience-cta container"><article><span>FOR CUSTOMERS</span><h2>Your favourites, ready when you arrive.</h2><p>Skip the queue and collect fresh from the shop.</p><Link className="button button-light" href="/shop">Find your paan<Icon name="arrow"/></Link></article><article><span>FOR PAAN SHOPS</span><h2>Bring your shop online.</h2><p>List real inventory, manage pickup orders, and receive payment directly.</p><Link className="button button-gold" href="/sell">Start selling<Icon name="arrow"/></Link></article></section>
  </>;
}
