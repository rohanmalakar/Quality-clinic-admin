"use client";
import { get } from '@/utils/network';
import React, { useState, useEffect } from 'react';
// Assuming you have an API utility for HTTP requests
interface User {
  id: number;
  full_name: string;
  photo_url: string;
  email_address: string;
  phone_number: string;
  points: number;
  redeemed: boolean;
  total_visits: number;
}
interface DoctorAppointment {
  id: number;
  user_id: number;
  status: string;
  start_time: string;
  end_time: string;
  branch_name_en: string;
  branch_name_ar: string;
  name_en: string;
  name_ar: string;
  photo_url: string;
  date: string;
}

interface ServiceAppointment {
  id: number;
  user_id: number;
  status: string;
  branch_name_en: string;
  branch_name_ar: string;
  start_time: string;
  end_time: string;
  name_ar: string;
  name_en: string;
  category_name_en: string;
  category_name_ar: string;
  service_image_en_url: string;
  service_image_ar_url: string;
  date: string;
}

// Main Customer Dashboard Component
const CustomerDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [expandedUser, setExpandedUser] = useState<number | null>(null);
   const [activeTab, setActiveTab] = useState<'doctor' | 'service'>('doctor');
   const [doctorAppointments, setDoctorAppointments] = useState<Record<number, DoctorAppointment[]>>({});
   const [serviceAppointments, setServiceAppointments] = useState<Record<number, ServiceAppointment[]>>({});
  const [appointmentLoading, setAppointmentLoading] = useState<boolean>(false);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await get("/user/userMetrics");
        console.log(response);
        setUsers(response);
      } catch (err: any) {
        setError("Error fetching user data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Toggle user details expansion
  const toggleDetails = (userId: number) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      fetchAppointmentData(userId);
    }
  };

  // Fetch appointment data using the provided function
  const fetchAppointmentData = async (userId: number) => {
    setAppointmentLoading(true);
    try {
      // Fetch doctor appointments
      if (!doctorAppointments[userId]) {
        const doctorData = await get(`/booking/doctor/${userId}`);
        console.log(doctorData);
        setDoctorAppointments(prev => ({
          ...prev,
          [userId]: doctorData
        }));
      }
      
      // Fetch service appointments
      if (!serviceAppointments[userId]) {
        const serviceData = await get(`/booking/service/${userId}`);
        console.log(serviceData);
        setServiceAppointments(prev => ({
          ...prev,
          [userId]: serviceData
        }));
      }
    } catch (err: any) {
      console.error("Error fetching appointment data:", err);
    } finally {
      setAppointmentLoading(false);
    }
  };

  // Helper function to get initials from name
  const getInitials = (name: string): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="overflow-x-auto">
    <table className="table bordered-table sm-table mb-0">
      <thead>
        <tr>
          <th scope="col"></th>
          <th scope="col">ID</th>
          <th scope="col">Customer</th>
          <th scope="col">Email</th>
          <th scope="col">Phone Number</th>
          <th scope="col">Points</th>
          <th scope="col">Redeemed</th>
          <th scope="col">Total Visits</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.length > 0 ? (
          users.map((user) => (
            <React.Fragment key={user.id}>
              <CustomerRow 
                user={user} 
                expandedUser={expandedUser}
                toggleDetails={toggleDetails}
                getInitials={getInitials}
              />
              {expandedUser === user.id && (
                <AppointmentDetailsRow 
                  user={user}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  doctorAppointments={doctorAppointments[user.id] || []}
                  serviceAppointments={serviceAppointments[user.id] || []}
                  appointmentLoading={appointmentLoading}
                />
              )}
            </React.Fragment>
          ))
        ) : (
          <tr>
            <td colSpan={9} className="text-center py-2">
              No customers available.
            </td>
          </tr>
        )}
      </tbody>
    </table>
    </div>
  );
};

interface CustomerRowProps {
  user: any;
  expandedUser: number | null;
  toggleDetails: (userId: number) => void;
  getInitials: (name: string) => string;
}

// Customer Row Component
const CustomerRow: React.FC<CustomerRowProps> = ({ user, expandedUser, toggleDetails, getInitials }) => {
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: '#666',
            border: '1px solid #eaeaea'
          }}>
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              getInitials(user.full_name)
            )}
          </div>
        </div>
      </td>
      <td>{user.id}</td>
      <td><span>{user.full_name}</span></td>
      <td><span>{user.email_address}</span></td>
      <td><span>{user.phone_number}</span></td>
      <td>{user.points}</td>
      <td>{user.redeemed ? "Yes" : "No"}</td>
      <td>{user.total_visits}</td>
      <td>
        <button 
          style={{ 
            border: 'none',
            background: expandedUser === user.id ? '#007bff' : '#f0f0f0',
            color: expandedUser === user.id ? 'white' : 'black',
            padding: '4px 8px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          onClick={() => toggleDetails(user.id)}
        >
          View Details
        </button>
      </td>
    </tr>
  );
};

interface AppointmentDetailsRowProps {
  user: any;
  activeTab: 'doctor' | 'service';
  setActiveTab: (tab: 'doctor' | 'service') => void;
  doctorAppointments: any[];
  serviceAppointments: any[];
  appointmentLoading: boolean;
}

// Appointment Details Row Component
const AppointmentDetailsRow: React.FC<AppointmentDetailsRowProps> = ({ 
  user, 
  activeTab, 
  setActiveTab, 
  doctorAppointments, 
  serviceAppointments, 
  appointmentLoading 
}) => {
  return (
    <tr>
      <td colSpan={9}>
        <div className="p-3">
          {/* Tabs navigation */}
          <TabNavigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />

          {/* Tab content */}
          {appointmentLoading ? (
            <div className="text-center py-3">Loading appointment data...</div>
          ) : (
            <>
              {activeTab === 'doctor' && (
                <DoctorAppointmentsTable appointments={doctorAppointments} />
              )}
              {activeTab === 'service' && (
                <ServiceAppointmentsTable appointments={serviceAppointments} />
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

interface TabNavigationProps {
  activeTab: 'doctor' | 'service';
  setActiveTab: (tab: 'doctor' | 'service') => void;
}

// Tab Navigation Component
const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mb-3">
      <button
        style={{ 
          border: 'none',
          background: activeTab === 'doctor' ? '#007bff' : '#f0f0f0',
          color: activeTab === 'doctor' ? 'white' : 'black',
          padding: '6px 12px',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '13px',
          marginRight: '8px'
        }}
        onClick={() => setActiveTab('doctor')}
      >
        Doctor Appointment History
      </button>
      <button
        style={{ 
          border: 'none',
          background: activeTab === 'service' ? '#007bff' : '#f0f0f0',
          color: activeTab === 'service' ? 'white' : 'black',
          padding: '6px 12px',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '13px'
        }}
        onClick={() => setActiveTab('service')}
      >
        Service Appointment History
      </button>
    </div>
  );
};

interface AppointmentsTableProps {
  appointments: any[];
}

// Doctor Appointments Table Component
const DoctorAppointmentsTable: React.FC<AppointmentsTableProps> = ({ appointments }) => {
  return (
    <div  className="overflow-x-auto">
      
      <table className="table bordered-table sm-table mb-0">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Date</th>
            <th>Time</th>
            <th>Doctor</th>
            <th>Branch</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments?.length > 0 ? (
            appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.id}</td>
                <td>{new Date(appointment.date).toLocaleDateString()}</td>
                <td>{appointment.start_time} - {appointment.end_time}</td>
                <td>{appointment.name_en}</td>
                <td>{appointment.branch_name_en}</td>
                <td>
                  <StatusBadge date={appointment.date} start_time={appointment.start_time} end_time={appointment.end_time} status={appointment.status} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-2">
                No doctor appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Service Appointments Table Component
const ServiceAppointmentsTable: React.FC<AppointmentsTableProps> = ({ appointments }) => {
  return (
    <div className="overflow-x-auto" >
      <table className="table bordered-table sm-table mb-0">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Date</th>
            <th>Time</th>
            <th>Service</th>
            <th>Branch</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments?.length > 0 ? (
            appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.id}</td>
                <td>{new Date(appointment.date).toLocaleDateString()}</td>
                <td>{`${appointment.start_time} - ${appointment.end_time}`}</td>
                <td>{appointment.name_en}</td>
                <td>{appointment.branch_name_en}</td>
                <td>
                  <StatusBadge status={appointment.status} date={appointment.date} start_time={appointment.start_time} end_time={appointment.end_time} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-2">
                No service appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

interface StatusBadgeProps {
  status: string;
  date: string;
  start_time: string;
  end_time: string;
}

// Reusable Status Badge Component
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, date, start_time, end_time }) => {
  const getBadgeStyles = (status: string) => {
    const styles = {
      backgroundColor: '#ffeeba',
      color: '#856404'
    };
    
    switch(status) {
      case 'COMPLETED':
        styles.backgroundColor = '#d4edda';
        styles.color = '#155724';
        break;
      case 'CANCELLED':
        styles.backgroundColor = '#f8d7da';
        styles.color = '#721c24';
        break;
      case 'SCHEDULED':
        styles.backgroundColor = '#cce5ff';
        styles.color = '#004085';
        break;
      case 'NO-SHOW':
        styles.backgroundColor = '#FFD041';
        styles.color = '#D35400';
        break;
      default:
        break;
    }
    
    return styles;
  };

  if (Date.now() > new Date(date).getTime() && status === 'SCHEDULED') {
    status = 'NO-SHOW';
  }
  
  const styles = {
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '11px',
    ...getBadgeStyles(status)
  };
  
  return <span style={styles}>{status}</span>;
};

export default CustomerDashboard;