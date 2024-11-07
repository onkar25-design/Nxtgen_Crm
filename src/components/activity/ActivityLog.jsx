import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faChevronDown, faFilter, faClipboardList } from '@fortawesome/free-solid-svg-icons'; // Import Font Awesome icons
import { supabase } from '../../../supabaseClient'; // Import Supabase client
import './ActivityLog.css'; // Import the CSS file

export default function ActivityLog() {
  const [activities, setActivities] = useState([]); // State to hold activities
  const [filteredActivities, setFilteredActivities] = useState([]); // State to hold filtered activities
  const [dateRange, setDateRange] = useState('7d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch activities from the database when the component mounts
  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('activity, action, date, time, activity_by')
        .order('date', { ascending: false }) // Order by date in descending order
        .order('time', { ascending: false }); // Order by time in descending order

      if (error) {
        console.error('Error fetching activities:', error);
      } else {
        setActivities(data);
        setFilteredActivities(data); // Initialize filtered activities
      }
    };

    fetchActivities();
  }, []);

  // Function to filter activities based on date range
  const filterActivities = () => {
    let filtered = [...activities];
    const today = new Date();

    if (dateRange === '7d') {
      const last7Days = new Date(today.setDate(today.getDate() - 7));
      filtered = filtered.filter(activity => new Date(activity.date) >= last7Days);
    } else if (dateRange === '1m') {
      const last1Month = new Date(today.setMonth(today.getMonth() - 1));
      filtered = filtered.filter(activity => new Date(activity.date) >= last1Month);
    } else if (dateRange === '3m') {
      const last3Months = new Date(today.setMonth(today.getMonth() - 3));
      filtered = filtered.filter(activity => new Date(activity.date) >= last3Months);
    } else if (dateRange === '6m') {
      const last6Months = new Date(today.setMonth(today.getMonth() - 6));
      filtered = filtered.filter(activity => new Date(activity.date) >= last6Months);
    } else if (dateRange === '1y') {
      const last1Year = new Date(today.setFullYear(today.getFullYear() - 1));
      filtered = filtered.filter(activity => new Date(activity.date) >= last1Year);
    }

    // Filter by custom date range if both dates are provided
    if (startDate && endDate) {
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= new Date(startDate) && activityDate <= new Date(endDate);
      });
    }

    setFilteredActivities(filtered);
  };

  return (
    <div className="activity-log-container">
      <div className="activity-log-header">
        <h1 className="activity-log-title">
          <FontAwesomeIcon icon={faClipboardList} className="activity-log-title-icon" /> {/* Green icon */}
          Activity Log
        </h1>
        <div className="activity-log-filters">
          <div className="activity-log-relative">
            <select
              className="activity-log-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              {/* Date range options */}
              <option value="7d">Last 7 Days</option>
              <option value="1m">1 Month</option>
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
            </select>
            <div className="activity-log-chevron">
              <FontAwesomeIcon icon={faChevronDown} />
            </div>
          </div>
          <div className="activity-log-date-range">
            <input
              type="date"
              className="activity-log-date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              className="activity-log-date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button className="activity-log-filter-button" onClick={filterActivities}>
            <FontAwesomeIcon icon={faFilter} />
          </button>
        </div>
      </div>
      <div className="activity-log-table-container">
        <table className="activity-log-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Action</th>
              <th>Activity By</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.activity}</td>
                <td>
                  <span className={`activity-log-badge activity-log-badge-${activity.action.toLowerCase()}`}>
                    {activity.action}
                  </span>
                </td>
                <td>{activity.activity_by}</td>
                <td>
                  <div className="activity-log-date">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> {/* Calendar icon */}
                    {activity.date}
                  </div>
                </td>
                <td>
                  <div className="activity-log-time">
                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                    {activity.time}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
