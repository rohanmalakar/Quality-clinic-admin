"use client";
import { get } from '@/utils/network';
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Interfaces
interface Booking {
  id: number;
  user_id: number;
  user_full_name: string;
  user_phone_number: string;
  user_email: string;
  branch_id: number;
  branch_name_en: string;
  branch_name_ar: string;
  service_id: number;
  service_actual_price: string | null;
  vat_percentage: string;
  service_discounted_price: string | null;
  service_name_en: string | null;
  service_name_ar: string | null;
  service_category_id: number | null;
  service_category_type: string | null;
  service_category_name_en: string | null;
  service_category_name_ar: string | null;
  booking_date: string;
  booking_status: BookingStatus;
}

interface ApiResponse {
  success: boolean;
  data: Booking[];
}

interface Stats {
  total: number;
  completed: number;
  scheduled: number;
  canceled: number;
  revenue: number;
}

interface StatusChartData {
  name: string;
  value: number;
  color: string;
}

interface BranchChartData {
  name: string;
  count: number;
}

interface DailyBookingData {
  date: string;
  bookings: number;
}

type BookingStatus = 'COMPLETED' | 'SCHEDULED' | 'CANCELED';
type TimeFilter = 'today' | 'week' | 'month' | 'all';

const BookingDashboard: React.FC = () => {
  const [bookingsData, setBookingsData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await await get('/booking/service/metric');
      console.log(response);
    
        setBookingsData(response);
        setError(null);
     
    } catch (err) {
      setError('Error fetching data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = useMemo<Booking[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookingsData.filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      bookingDate.setHours(0, 0, 0, 0);

      switch (timeFilter) {
        case 'today':
          return bookingDate.getTime() === today.getTime();
        
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          return bookingDate >= weekAgo && bookingDate <= today;
        
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          return bookingDate >= monthAgo && bookingDate <= today;
        
        case 'all':
        default:
          return true;
      }
    });
  }, [bookingsData, timeFilter]);

  const stats = useMemo<Stats>(() => {
    if (!getFilteredBookings.length) {
      return { total: 0, completed: 0, scheduled: 0, canceled: 0, revenue: 0 };
    }
    
    const completed = getFilteredBookings.filter(b => b.booking_status === 'COMPLETED').length;
    const scheduled = getFilteredBookings.filter(b => b.booking_status === 'SCHEDULED').length;
    const canceled = getFilteredBookings.filter(b => b.booking_status === 'CANCELED').length;
    
    const revenue = getFilteredBookings
      .filter(b => b.service_discounted_price && b.booking_status === 'COMPLETED')
      .reduce((sum, b) => sum + parseFloat(b.service_discounted_price!), 0);

    return { total: getFilteredBookings.length, completed, scheduled, canceled, revenue };
  }, [getFilteredBookings]);

  const statusData: StatusChartData[] = [
    { name: 'Completed', value: stats.completed, color: '#28a745' },
    { name: 'Scheduled', value: stats.scheduled, color: '#ffc107' },
    { name: 'Canceled', value: stats.canceled, color: '#dc3545' }
  ];

  const branchData = useMemo<BranchChartData[]>(() => {
    if (!getFilteredBookings.length) return [];
    
    const branches: Record<string, number> = {};
    getFilteredBookings.forEach(b => {
      branches[b.branch_name_en] = (branches[b.branch_name_en] || 0) + 1;
    });
    return Object.entries(branches).map(([name, count]) => ({ name, count }));
  }, [getFilteredBookings]);

  const dailyBookingsData = useMemo<DailyBookingData[]>(() => {
    if (!getFilteredBookings.length) return [];
    
    const dailyCount: Record<string, number> = {};
    getFilteredBookings.forEach(b => {
      const date = b.booking_date;
      dailyCount[date] = (dailyCount[date] || 0) + 1;
    });
    
    return Object.entries(dailyCount)
      .map(([date, bookings]) => ({ date, bookings }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [getFilteredBookings]);

  const serviceTypeData = useMemo(() => {
    if (!getFilteredBookings.length) return [];
    
    const services: Record<string, number> = {};
    getFilteredBookings.forEach(b => {
      const serviceName = b.service_category_type || 'Unknown';
      services[serviceName] = (services[serviceName] || 0) + 1;
    });
    
    return Object.entries(services).map(([name, value]) => ({ name, value }));
  }, [getFilteredBookings]);

  const getTimeFilterLabel = (filter: TimeFilter): string => {
    const labels: Record<TimeFilter, string> = {
      'today': 'Today',
      'week': 'This Week',
      'month': 'This Month',
      'all': 'All Time'
    };
    return labels[filter];
  };

  if (loading) {
    return (
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="alert alert-danger m-4" role="alert">
          {error}
          <button className="btn btn-primary ms-3" onClick={fetchBookings}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
          <h1 className="mb-0">Services Dashboard</h1>
          <div className="btn-group flex-wrap" role="group">
            <button
              type="button"
              className={`btn btn-sm ${timeFilter === 'today' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setTimeFilter('today')}
            >
              Today
            </button>
            <button
              type="button"
              className={`btn btn-sm ${timeFilter === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setTimeFilter('week')}
            >
              This Week
            </button>
            <button
              type="button"
              className={`btn btn-sm ${timeFilter === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setTimeFilter('month')}
            >
              This Month
            </button>
            <button
              type="button"
              className={`btn btn-sm ${timeFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setTimeFilter('all')}
            >
              All Time
            </button>
          </div>
        </div>

        <div className="row g-2 g-md-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-3">
                <h6 className="text-muted mb-2 fs-6">Total Bookings</h6>
                <h3 className="mb-0 text-primary">{stats.total}</h3>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-3">
                <h6 className="text-muted mb-2 fs-6">Completed</h6>
                <h3 className="mb-0 text-success">{stats.completed}</h3>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-3">
                <h6 className="text-muted mb-2 fs-6">Scheduled</h6>
                <h3 className="mb-0 text-warning">{stats.scheduled}</h3>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-3">
                <h6 className="text-muted mb-2 fs-6">Revenue (SAR)</h6>
                <h3 className="mb-0 text-info">{stats.revenue.toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-2 g-md-3 mb-4">
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 fs-6">Booking Status Distribution</h5>
              </div>
              <div className="card-body">
                {stats.total > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5 text-muted">No data available</div>
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 fs-6">Bookings by Branch</h5>
              </div>
              <div className="card-body">
                {branchData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={branchData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0d6efd" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5 text-muted">No data available</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-2 g-md-3 mb-4">
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 fs-6">Daily Bookings Trend</h5>
              </div>
              <div className="card-body">
                {dailyBookingsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyBookingsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="bookings" stroke="#0d6efd" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5 text-muted">No data available</div>
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 fs-6">Service Types</h5>
              </div>
              <div className="card-body">
                {serviceTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie 
                        data={serviceTypeData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={80}
                        label
                      >
                        {serviceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5 text-muted">No data available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDashboard;