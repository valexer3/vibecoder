function Row() {
  return (
    <span className="marquee-content">
      <span>🇰🇷 Корея — Hyundai · Kia · Genesis</span>
      <span className="marquee-sep">•</span>
      <span>🇨🇳 Китай — BYD · Zeekr · Chery · Geely</span>
      <span className="marquee-sep">•</span>
    </span>
  );
}

export default function BrandsMarquee() {
  return (
    <div className="marquee">
      <p className="marquee-label">Работаем с брендами</p>
      <div className="marquee-track">
        <div className="marquee-track-inner">
          <Row />
          <Row />
        </div>
      </div>
    </div>
  );
}
