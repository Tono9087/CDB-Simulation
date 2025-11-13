import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * DeviceChart Component
 *
 * Displays device type breakdown in a pie chart
 */
const DeviceChart = ({ data }) => {
  const chartData = [
    { name: 'Desktop', value: data.desktop },
    { name: 'Mobile', value: data.mobile },
    { name: 'Tablet', value: data.tablet },
  ].filter((item) => item.value > 0);

  const COLORS = ['#DA292E', '#FFD700', '#00ff88'];

  return (
    <div className="apex-card">
      <h3 className="text-xl font-bold mb-4 text-apex-gold">Device Types</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1C1C1E',
                border: '1px solid #DA292E',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          No data available
        </div>
      )}
    </div>
  );
};

export default DeviceChart;
