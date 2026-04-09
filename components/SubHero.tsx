import { getSiteHeroImage, type SiteHeroKey } from "@/lib/site-media";

export default async function SubHero({
  title,
  desc,
  heroKey,
}: {
  title: string;
  desc: string;
  heroKey: SiteHeroKey;
}) {
  const backgroundImage = await getSiteHeroImage(heroKey);

  return (
    <div className="sub-hero">
      <div
        className="sub-hero-bg"
        style={{ backgroundImage: `url("${backgroundImage}")` }}
      />
      <div className="sub-hero-text">
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
    </div>
  );
}
