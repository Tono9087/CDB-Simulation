import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * LocationChart Component
 *
 * Displays top countries/cities in a bar chart
 */
const LocationChart = ({ data, title }) => {
  return (
    <div className="apex-card">
      <h3 className="text-xl font-bold mb-4 text-apex-gold">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="name" stroke="#999" />
          <YAxis stroke="#999" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1C1C1E',
              border: '1px solid #DA292E',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#DA292E" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LocationChart;
