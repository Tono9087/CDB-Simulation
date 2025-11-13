import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * TimelineChart Component
 *
 * Displays attempts over time in a line chart
 */
const TimelineChart = ({ data }) => {
  return (
    <div className="apex-card">
      <h3 className="text-xl font-bold mb-4 text-apex-gold">Attempts Over Time (24h)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="hour" stroke="#999" />
          <YAxis stroke="#999" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1C1C1E',
              border: '1px solid #DA292E',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#00ff88"
            strokeWidth={2}
            dot={{ fill: '#00ff88' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimelineChart;
