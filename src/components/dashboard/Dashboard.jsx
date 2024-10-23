import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2'; // Import Bar component
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'; // Import necessary components
import './Dashboard.css'; // Import the CSS file

// Register the components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  // Sample data for the charts
  const leadsWonByMonthData = {
    labels: ['January', 'February', 'March', 'April'],
    datasets: [
      {
        label: 'Leads Won',
        data: [30, 50, 70, 40],
        backgroundColor: '#36A2EB',
      },
    ],
  };

  const leadsByStatusData = {
    labels: ['New', 'Contacted', 'Qualified', 'Converted'],
    datasets: [
      {
        data: [300, 50, 100, 40],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const leadsBySourceData = {
    labels: ['Website', 'Referral', 'Social Media', 'Email'],
    datasets: [
      {
        data: [200, 150, 100, 50],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Lead Dashboard</h1>
      <div className="dashboard-charts">
        <div className="dashboard-chart-container">
          <h2>Total Leads</h2>
          <p>1,234</p>
        </div>
        <div className="dashboard-chart-container">
          <h2>New Leads</h2>
          <p>256</p>
        </div>
        <div className="dashboard-chart-container">
          <h2>Calls Made</h2>
          <p>789</p>
        </div>
        <div className="dashboard-chart-container">
          <h2>Appointments</h2>
          <p>45</p>
        </div>
        <div className="dashboard-chart-container">
          <h2>Leads Won</h2>
          <p>98</p>
        </div>
        <div className="dashboard-chart-container">
          <h2>Total Won Amount</h2>
          <p>$1.2M</p>
        </div>
      </div>
      <div className="dashboard-charts">
        <div className="dashboard-chart-container dashboard-bar-chart">
          <h2>Leads Won by Month</h2>
          <Bar data={leadsWonByMonthData} options={{ responsive: true }} />
        </div>
        <div className="dashboard-chart-container dashboard-doughnut-chart">
          <h2>Leads by Status</h2>
          <Doughnut data={leadsByStatusData} />
        </div>
        <div className="dashboard-chart-container dashboard-doughnut-chart">
          <h2>Leads by Source</h2>
          <Doughnut data={leadsBySourceData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
