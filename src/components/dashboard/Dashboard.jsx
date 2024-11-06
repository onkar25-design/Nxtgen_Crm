import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart as BarChartIcon, Phone, Calendar, Trophy } from 'lucide-react';
import './Dashboard.css';
import { supabase } from '../../../supabaseClient'; // Import the Supabase client

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

const Dashboard = () => {
  const [totalLeads, setTotalLeads] = React.useState(0);
  const [totalCalls, setTotalCalls] = React.useState(0);
  const [totalAppointments, setTotalAppointments] = React.useState(0);
  const [newLeads, setNewLeads] = React.useState(0);
  const [wonLeads, setWonLeads] = React.useState(0);
  const [qualifiedLeads, setQualifiedLeads] = React.useState(0);
  const [propositionLeads, setPropositionLeads] = React.useState(0);
  const [statusData, setStatusData] = React.useState([]);
  const [topEmployeesData, setTopEmployeesData] = React.useState([]);
  const [monthlyCallsData, setMonthlyCallsData] = React.useState([]);
  const [monthlyAppointmentsData, setMonthlyAppointmentsData] = React.useState([]);
  const [sourceData, setSourceData] = React.useState([]);
  const [monthlyData, setMonthlyData] = React.useState([]); // Define state for monthly data
  const [columnStages, setColumnStages] = useState(['new', 'qualified', 'proposition', 'won']); // Add this line

  React.useEffect(() => {
    const fetchData = async () => {
      // Fetch total leads
      const { count: leadsCount } = await supabase
        .from('client_leads')
        .select('*', { count: 'exact' });
      setTotalLeads(leadsCount);

      // Fetch new leads
      const { count: newLeadsCount } = await supabase
        .from('client_leads')
        .select('*', { count: 'exact' })
        .eq('stage', 'new');
      setNewLeads(newLeadsCount);

      // Fetch won leads
      const { count: wonLeadsCount } = await supabase
        .from('client_leads')
        .select('*', { count: 'exact' })
        .eq('stage', 'won');
      setWonLeads(wonLeadsCount);

      // Fetch qualified leads
      const { count: qualifiedLeadsCount } = await supabase
        .from('client_leads')
        .select('*', { count: 'exact' })
        .eq('stage', 'qualified');
      setQualifiedLeads(qualifiedLeadsCount);

      // Fetch proposition leads
      const { count: propositionLeadsCount } = await supabase
        .from('client_leads')
        .select('*', { count: 'exact' })
        .eq('stage', 'proposition');
      setPropositionLeads(propositionLeadsCount);

      // Fetch total calls
      const { count: callsCount } = await supabase
        .from('calls')
        .select('*', { count: 'exact' });
      setTotalCalls(callsCount);

      // Fetch total appointments
      const { count: appointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' });
      setTotalAppointments(appointmentsCount);

      // Update status data
      setStatusData([
        { name: 'New', value: newLeadsCount, color: '#FF6B6B' },
        { name: 'Qualified', value: qualifiedLeadsCount, color: '#FFD93D' },
        { name: 'Won', value: wonLeadsCount, color: '#4ECDC4' },
        { name: 'Proposition', value: propositionLeadsCount, color: '#4CAF50' },
      ]);

      // Fetch all leads to process for total leads by month
      const { data: allLeadsData, error: allLeadsDataError } = await supabase
        .from('client_leads')
        .select('created_at'); // Use the correct column name

      if (allLeadsDataError) {
        console.error('Error fetching all leads:', allLeadsDataError);
      } else {
        // Process leads data to count by month
        const leadsCountByMonth = allLeadsData.reduce((acc, lead) => {
          const month = new Date(lead.created_at).toLocaleString('default', { month: 'long' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        // Convert to array format for the chart
        const formattedLeadsData = Object.entries(leadsCountByMonth).map(([month, count]) => ({
          name: month,
          leads: count,
        }));

        // Update the monthlyData state with the total leads by month
        setMonthlyData(formattedLeadsData);
      }

      // Fetch all calls
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('date');

      if (callsError) {
        console.error('Error fetching calls data:', callsError);
      } else {
        // Process calls data to count by month
        const callsCountByMonth = callsData.reduce((acc, call) => {
          const month = new Date(call.date).toLocaleString('default', { month: 'long' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        // Convert to array format
        const formattedCallsData = Object.entries(callsCountByMonth).map(([month, count]) => ({
          month,
          count,
        }));

        setMonthlyCallsData(formattedCallsData);
      }

      // Fetch all appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('date');

      if (appointmentsError) {
        console.error('Error fetching appointments data:', appointmentsError);
      } else {
        // Process appointments data to count by month
        const appointmentsCountByMonth = appointmentsData.reduce((acc, appointment) => {
          const month = new Date(appointment.date).toLocaleString('default', { month: 'long' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        // Convert to array format
        const formattedAppointmentsData = Object.entries(appointmentsCountByMonth).map(([month, count]) => ({
          month,
          count,
        }));

        setMonthlyAppointmentsData(formattedAppointmentsData);
      }

      // Fetch source data from client_leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('client_leads')
        .select('lead_source');

      if (leadsError) {
        console.error('Error fetching leads data:', leadsError);
      } else {
        // Process the leads to count by lead_source
        const sourceCounts = leadsData.reduce((acc, lead) => {
          const source = lead.lead_source.trim().toLowerCase(); // Normalize to lowercase
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {});

        // Convert to array format and set colors
        const formattedSourceData = Object.entries(sourceCounts).map(([source, count]) => ({
          name: source.charAt(0).toUpperCase() + source.slice(1), // Capitalize the first letter
          value: count,
          color: source === 'email' ? '#4CAF50' : // Green for Email
                 source === 'website' ? '#FFD93D' : // Yellow for Website
                 source === 'referral' ? '#FF6B6B' : // Red for Referral
                 source === 'social media' ? '#4ECDC4' : // Teal for Social Media
                 '#95A5A6', // Default color for any other source
        }));

        setSourceData(formattedSourceData);
      }

      // Fetch all columns to dynamically get their stages
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('id'); // Fetch column IDs

      if (columnsError) {
        console.error('Error fetching columns:', columnsError);
        return;
      }

      // Update columnStages based on fetched columns
      const stages = columnsData.map(col => col.id);
      setColumnStages(stages);

      // Fetch leads for each stage dynamically
      const leadsCounts = await Promise.all(stages.map(async (stage) => {
        const { count } = await supabase
          .from('client_leads')
          .select('*', { count: 'exact' })
          .eq('stage', stage);
        return { stage, count };
      }));

      // Update state for each lead count
      leadsCounts.forEach(({ stage, count }) => {
        if (stage === 'new') setNewLeads(count);
        else if (stage === 'won') setWonLeads(count);
        else if (stage === 'qualified') setQualifiedLeads(count);
        else if (stage === 'proposition') setPropositionLeads(count);
      });

      // Update status data
      setStatusData(leadsCounts.map(({ stage, count }) => ({
        name: stage.charAt(0).toUpperCase() + stage.slice(1), // Capitalize stage name
        value: count,
        color: stage === 'new' ? '#FF6B6B' :
               stage === 'qualified' ? '#FFD93D' :
               stage === 'won' ? '#4ECDC4' :
               stage === 'proposition' ? '#4CAF50' : '#95A5A6', // Default color
      })));
    };

    fetchData();
  }, []); // Empty dependency array to run once on mount

  // Prepare data for comparison chart
  const comparisonData = monthlyCallsData.map((call) => ({
    month: call.month,
    calls: call.count,
    appointments: monthlyAppointmentsData.find((appointment) => appointment.month === call.month)?.count || 0,
  }));

  console.log('Comparison Data:', comparisonData); // Log the comparison data

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
          <StatCard icon={BarChartIcon} title="Total Leads" value={totalLeads} iconColor="#4CAF50" />
          <StatCard icon={BarChartIcon} title="New Leads" value={newLeads} iconColor="#FF6B6B" />
          <StatCard icon={BarChartIcon} title="Qualified Leads" value={qualifiedLeads} iconColor="#FFD93D" />
          <StatCard icon={Trophy} title="Leads Won" value={wonLeads} iconColor="#FFD93D" /> 
          <StatCard icon={Phone} title="Total Calls" value={totalCalls} iconColor="#FFD93D" />
          <StatCard icon={Calendar} title="Total Appointments" value={totalAppointments} iconColor="#4ECDC4" />
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
            <h2>Total Leads by Month</h2>
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
            <h2>Calls and Appointments by Month</h2>
            <div className="chart-container">
              <ResponsiveContainer>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="calls" fill="#4ECDC4" />
                  <Bar dataKey="appointments" fill="#FF6B6B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h2>Leads by Status</h2>
            <div className="chart-container">
              <ResponsiveContainer>
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#FFD93D" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
