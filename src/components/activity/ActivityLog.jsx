import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faChevronDown, faFilter, faClipboardList } from '@fortawesome/free-solid-svg-icons'; // Import Font Awesome icons
import './ActivityLog.css'; // Import the CSS file

const activities = [
  { id: 1, activity: 'Added Company Contact #48', action: 'Add', activityBy: 'Super Admin', date: '2024-02-10', time: '12:12 PM' },
  { id: 2, activity: 'Added Company #30', action: 'Add', activityBy: 'Super Admin', date: '2024-02-10', time: '12:10 PM' },
  { id: 3, activity: 'Edited Lead #49', action: 'Edit', activityBy: 'Super Admin', date: '2024-02-10', time: '12:09 PM' },
  { id: 4, activity: 'Added Lead Call #22', action: 'Add', activityBy: 'Super Admin', date: '2024-02-10', time: '12:08 PM' },
  { id: 5, activity: 'Added Lead Notes #14', action: 'Add', activityBy: 'Super Admin', date: '2024-02-10', time: '12:08 PM' },
  { id: 6, activity: 'Added Lead Appointment #26', action: 'Add', activityBy: 'Super Admin', date: '2024-02-10', time: '12:07 PM' },
  { id: 7, activity: 'Deleted Lead #48', action: 'Delete', activityBy: 'Super Admin', date: '2024-02-10', time: '12:03 PM' },
];

const dateRanges = [
  { label: 'Last 7 Days', value: '7d' },
  { label: '1 Month', value: '1m' },
  { label: '3 Months', value: '3m' },
  { label: '6 Months', value: '6m' },
  { label: '1 Year', value: '1y' },
];

export default function ActivityLog() {
  const [dateRange, setDateRange] = useState('7d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
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
          <button className="activity-log-filter-button">
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
            {activities.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.activity}</td>
                <td>
                  <span className={`activity-log-badge activity-log-badge-${activity.action.toLowerCase()}`}>
                    {activity.action}
                  </span>
                </td>
                <td>{activity.activityBy}</td>
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
