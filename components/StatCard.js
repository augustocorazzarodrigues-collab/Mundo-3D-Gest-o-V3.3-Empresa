export default function StatCard({ title, value, description, icon='•', toneClass='blue', iconBg='#e8f0ff', iconColor='#1f3a5a' }) {
  return (
    <div className={`stat-card ${toneClass}`}>
      <div className="stat-top">
        <div className="stat-title">{title}</div>
        <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-desc">{description}</div>
    </div>
  );
}
