import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart as BarChartIcon, Phone, Calendar, Trophy, DollarSign } from 'lucide-react';
import './Dashboard.css';

const monthlyData = [
  { name: 'January', leads: 25 },
  { name: 'February', leads: 35 },
  { name: 'March', leads: 45 },
  { name: 'April', leads: 30 },
];

const statusData = [
  { name: 'New', value: 300, color: '#FF6B6B' },
  { name: 'Contacted', value: 200, color: '#4ECDC4' },
  { name: 'Qualified', value: 150, color: '#FFD93D' },
  { name: 'Converted', value: 100, color: '#95A5A6' },
];

const sourceData = [
  { name: 'Website', value: 400, color: '#FF6B6B' },
  { name: 'Referral', value: 300, color: '#4ECDC4' },
  { name: 'Social Media', value: 200, color: '#FFD93D' },
  { name: 'Email', value: 100, color: '#95A5A6' },
];

const topEmployeesData = [
  { name: 'John Doe', revenue: 250000 },
  { name: 'Jane Smith', revenue: 200000 },
  { name: 'Mike Johnson', revenue: 180000 },
  { name: 'Sarah Williams', revenue: 150000 },
  { name: 'Tom Brown', revenue: 120000 },
];

const conversionData = [
  { name: 'Q1', rate: 65 },
  { name: 'Q2', rate: 75 },
  { name: 'Q3', rate: 82 },
  { name: 'Q4', rate: 88 },
];

const StatCard = ({ icon: Icon, title, value, iconColor }) => (
  <div className="stat-card">
    <div className="stat-content">
      <div>
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
      <Icon className="stat-icon" style={{ color: iconColor }} />
    </div>
  </div>
);

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>
            <BarChartIcon style={{ color: '#4CAF50', marginRight: '8px' }} />
            Dashboard
          </h1>
        </div>

        <div className="stats-grid">
          <StatCard icon={BarChartIcon} title="Total Leads" value="1,234" iconColor="#4CAF50" />
          <StatCard icon={BarChartIcon} title="New Leads" value="256" iconColor="#FF6B6B" />
          <StatCard icon={Phone} title="Calls Made" value="789" iconColor="#FFD93D" />
          <StatCard icon={Calendar} title="Appointments" value="45" iconColor="#4ECDC4" />
          <StatCard icon={Trophy} title="Leads Won" value="98" iconColor="#FFD93D" />
          <StatCard icon={DollarSign} title="Total Won Amount" value="$1.2M" iconColor="#FFD700" />
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <h2>Leads by Status</h2>
            <div className="chart-container">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h2>Leads by Source</h2>
            <div className="chart-container">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={sourceData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h2>Leads Won by Month</h2>
            <div className="chart-container">
              <ResponsiveContainer>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="leads" fill="#4ECDC4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="charts-row-large">
          <div className="chart-card">
            <h2>Top 5 Revenue Generating Employees</h2>
            <div className="chart-container">
              <ResponsiveContainer>
                <BarChart data={topEmployeesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#FF6B6B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h2>Performance Overview</h2>
            <div className="chart-container">
              <ResponsiveContainer>
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#FFD93D" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
