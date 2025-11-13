/**
 * StatsCard Component
 *
 * Displays a single statistic with icon
 */
const StatsCard = ({ title, value, icon, color = 'text-apex-red' }) => {
  return (
    <div className="apex-card hover:border-apex-red/40 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm uppercase tracking-wide">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
        <div className={`text-5xl ${color} opacity-20`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatsCard;
