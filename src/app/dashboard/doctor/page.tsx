"use client";
import { useState, useEffect, useMemo } from 'react';
import dynamic from "next/dynamic";
import { get } from '@/utils/network';
import { ApexOptions } from 'apexcharts';

// Dynamically import ApexCharts with no SSR to prevent server-side rendering issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Interfaces for Type Safety
interface BookingData {
  id: number;
  user_id: number;
  user_full_name: string;
  user_email: string;
  booking_status: 'COMPLETED' | 'CANCELED' | 'SCHEDULED';
  doctor_id: number;
  doctor_name_en: string;
  doctor_name_ar: string;
  doctor_photo_url: string;
  doctor_session_fees: number;
  time_slot_id: number;
  time_slot_start_time: string;
  time_slot_end_time: string;
  branch_id: number;
  branch_name_en: string;
  branch_name_ar: string;
  booking_date: string;
}

interface DoctorStats {
  doctorId: number;
  doctorName: string;
  totalAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  rescheduledAppointments: number;
  totalIncome: number;
  completedIncome: number;
  futureIncome: number;
  photoUrl: string;
}

interface MonthlySalesData {
  month: string;
  totalSales: number;
  completedSales: number;
}

const DoctorAppointmentStatistics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [allBookingData, setAllBookingData] = useState<BookingData[]>([]);
  const [doctorStats, setDoctorStats] = useState<DoctorStats[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalAppointments: 0,
    totalIncome: 0,
    completedIncome: 0,
    futureIncome: 0,
    cancelationRate: 0
  });

  // Fetch all booking data once
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await get('/booking/doctor/metric');
        setAllBookingData(response);
      } catch (error) {
        console.error('Error fetching booking data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on timeFilter
  const filterDataByTime = (data: BookingData[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (timeFilter) {
      case 'today':
        return data.filter(booking => {
          const bookingDate = new Date(booking.booking_date);
          const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
          return bookingDay.getTime() === today.getTime();
        });

      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return data.filter(booking => {
          const bookingDate = new Date(booking.booking_date);
          return bookingDate >= weekAgo && bookingDate <= now;
        });

      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return data.filter(booking => {
          const bookingDate = new Date(booking.booking_date);
          return bookingDate >= monthAgo && bookingDate <= now;
        });

      case 'all':
      default:
        return data;
    }
  };

  // Process filtered data whenever timeFilter or allBookingData changes
  useEffect(() => {
    if (allBookingData.length > 0) {
      const filteredData = filterDataByTime(allBookingData);
      processBookingData(filteredData);
    }
  }, [timeFilter, allBookingData]);

  const processBookingData = (data: BookingData[]) => {

    // Process doctor-wise statistics
    const doctorStatsMap: { [key: number]: DoctorStats } = {};
    const monthlyStatsMap: { [key: string]: MonthlySalesData } = {};

    let totalAppointments = 0;
    let totalIncome = 0;
    let completedIncome = 0;
    let futureIncome = 0;
    let canceledAppointments = 0;

    data.forEach(booking => {
      const doctorId = booking.doctor_id;
      const sessionFees = booking.doctor_session_fees;
      const bookingDate = new Date(booking.booking_date);
      const monthKey = bookingDate.toLocaleString('default', { month: 'short' });

      // Initialize doctor stats
      if (!doctorStatsMap[doctorId]) {
        doctorStatsMap[doctorId] = {
          doctorId,
          doctorName: booking.doctor_name_en,
          totalAppointments: 0,
          completedAppointments: 0,
          canceledAppointments: 0,
          rescheduledAppointments: 0,
          totalIncome: 0,
          completedIncome: 0,
          futureIncome: 0,
          photoUrl: booking.doctor_photo_url
        };
      }

      // Monthly stats initialization
      if (!monthlyStatsMap[monthKey]) {
        monthlyStatsMap[monthKey] = {
          month: monthKey,
          totalSales: 0,
          completedSales: 0
        };
      }

      // Update doctor and monthly stats
      const doctorStat = doctorStatsMap[doctorId];
      doctorStat.totalAppointments++;
      doctorStat.totalIncome += sessionFees;
      monthlyStatsMap[monthKey].totalSales += sessionFees;

      // Handle different booking statuses
      switch (booking.booking_status) {
        case 'COMPLETED':
          doctorStat.completedAppointments++;
          doctorStat.completedIncome += sessionFees;
          monthlyStatsMap[monthKey].completedSales += sessionFees;
          break;
        case 'CANCELED':
          doctorStat.canceledAppointments++;
          canceledAppointments++;
          break;
        case 'SCHEDULED':
          doctorStat.futureIncome += sessionFees;
          futureIncome += sessionFees;
          break;
      }

      // Overall totals
      totalAppointments++;
      totalIncome += sessionFees;
      completedIncome += booking.booking_status === 'COMPLETED' ? sessionFees : 0;
    });

    // Convert maps to sorted arrays
    const processedDoctorStats = Object.values(doctorStatsMap)
      .sort((a, b) => b.totalIncome - a.totalIncome);

    const processedMonthlySales = Object.values(monthlyStatsMap)
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

    // Calculate overall stats
    const cancelationRate = totalAppointments > 0
      ? Math.round((canceledAppointments / totalAppointments) * 100)
      : 0;

    setDoctorStats(processedDoctorStats);
    setMonthlySales(processedMonthlySales);
    setTotalStats({
      totalAppointments,
      totalIncome,
      completedIncome,
      futureIncome,
      cancelationRate
    });
  };

  // Chart options for monthly sales
  const monthlySalesOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      stacked: false,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 5,
      },
    },
    xaxis: {
      categories: monthlySales.map(item => item.month),
      labels: {
        style: { colors: '#718096', fontSize: '12px' }
      }
    },
    yaxis: {
      title: { text: 'Sales (USD)', style: { color: '#718096' } },
      labels: {
        formatter: (value: number) => `$${value.toLocaleString()}`,
        style: { colors: '#718096', fontSize: '12px' }
      }
    },
    colors: ['#4C51BF', '#ED8936'],
    tooltip: {
      y: { formatter: (val: number) => `$${val.toLocaleString()}` }
    }
  }), [monthlySales]);

  const monthlySalesSeries = useMemo(() => [
    {
      name: 'Total Sales',
      data: monthlySales.map(item => item.totalSales)
    },
    {
      name: 'Completed Sales',
      data: monthlySales.map(item => item.completedSales)
    }
  ], [monthlySales]);

  // Loading spinner
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {/* Time Filter */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                <p
                  style={{ "backgroundColor": "#EC4899", "color": "white", "padding": "5px 10px", "marginLeft": "15px", "width": "fit-content" }}
                  className=" rounded-3 border-2 font-semibold fs-3">
                  Doctor booking Statistics
                </p>
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


              {/* Overall Statistics Cards */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card bg-primary-50">
                    <div className="card-body">
                      <h6 className="text-primary-600">Total Appointments</h6>
                      <h3>{totalStats.totalAppointments}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success-50">
                    <div className="card-body">
                      <h6 className="text-success-600">Total Income</h6>
                      <h3>${totalStats.totalIncome.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning-50">
                    <div className="card-body">
                      <h6 className="text-warning-600">Cancellation Rate</h6>
                      <h3>{totalStats.cancelationRate}%</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-info-50">
                    <div className="card-body">
                      <h6 className="text-info-600">Completed Income</h6>
                      <h3>${totalStats.completedIncome.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Sales Chart */}
              <div className="mb-4 rpw">
                <div className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Monthly Sales Overview</h5>
                      <ReactApexChart
                        options={monthlySalesOptions}
                        series={monthlySalesSeries}
                        type="bar"
                        height={350}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Performance Table */}
              <div className="table-responsive scroll-sm">
                <table className="table bordered-table sm-table mb-0">
                  <thead>
                    <tr>
                      <th scope="col"></th>
                      <th scope="col">Doctor</th>
                      <th scope="col">Total Appointments</th>
                      <th scope="col">Completed</th>
                      <th scope="col">Canceled</th>
                      <th scope="col">Total Income</th>
                      <th scope="col">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorStats.length > 0 ? (
                      doctorStats.map(doctor => (
                        <tr key={doctor.doctorId}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={doctor.photoUrl}
                                alt={doctor.doctorName}
                                className="rounded-circle me-2"
                                width="40"
                                height="40"
                              />

                            </div>
                          </td>
                          <td> {doctor.doctorName}</td>
                          <td>{doctor.totalAppointments}</td>
                          <td>{doctor.completedAppointments}</td>
                          <td>{doctor.canceledAppointments}</td>
                          <td>${doctor.totalIncome.toLocaleString()}</td>
                          <td>
                            {doctor.totalAppointments > 0
                              ? `${Math.round((doctor.completedAppointments / doctor.totalAppointments) * 100)}%`
                              : '0%'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-2">
                          No doctor statistics available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointmentStatistics;