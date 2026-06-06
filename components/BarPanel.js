export default function BarPanel({ title, subtitle, data={} }) {
  const values = Object.values(data || {});
  const max = Math.max(1, ...values, 1);
  return (
    <div className="surface panel">
      <h3 className="section-title">{title}</h3>
      {subtitle ? <div className="note">{subtitle}</div> : null}
      <div className="divider" />
      {Object.entries(data || {}).map(([label, value]) => (
        <div className="bar-row" key={label}>
          <div>{label}</div>
          <div className="bar"><span style={{ width: `${(Number(value||0)/max)*100}%` }} /></div>
          <div>{value}</div>
        </div>
      ))}
    </div>
  );
}
