export default function Hero({ kicker, title, description, actions }) {
  return (
    <section className="hero">
      {kicker ? <div className="hero-kicker">{kicker}</div> : null}
      <h2>{title}</h2>
      <p>{description}</p>
      {actions ? <div className="hero-actions">{actions}</div> : null}
    </section>
  );
}
