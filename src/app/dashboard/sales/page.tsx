"use client";
import { useState, useEffect, useMemo } from 'react';
import dynamic from "next/dynamic";
import { TrendingUp, Calendar, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { get } from '@/utils/network';

// Dynamically import ApexCharts with no SSR to prevent server-side rendering issues
const ReactApexChart = dynamic(() => import("react-apexcharts").then((mod) => mod.default), {
  ssr: false,
});

interface SalesCardProps {
  title: string;
  value: string;
  description: string;
  bgColor: string;
  textColor: string;
  icon?: React.ReactNode;
}

// Separate components for better code organization and optimization
const SalesCard: React.FC<SalesCardProps> = ({ title, value, description, bgColor, textColor, icon }) => (
  <div className="col-12 col-md-6 col-xl-4 mb-3">
    <div className={`card h-100 ${bgColor} border-0 shadow-sm`}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h6 className={`card-subtitle mb-0 ${textColor} fw-normal text-uppercase small`}>{title}</h6>
          {icon && <div className={textColor}>{icon}</div>}
        </div>
        <h2 className={`card-title mb-2 ${textColor} fw-bold`}>{value}</h2>
        <p className={`card-text small ${textColor} opacity-75 mb-0`}>{description}</p>
      </div>
    </div>
  </div>
);

interface ServiceTypeIndicatorProps {
  color: string;
  label: string;
  value: string;
}

const ServiceTypeIndicator: React.FC<ServiceTypeIndicatorProps> = ({ color, label, value }) => (
  <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
    <div className="d-flex align-items-center">
      <span className="me-3" style={{ color, fontSize: '1.25rem' }}>●</span>
      <span className="text-muted dark:text-gray-400">{label}</span>
    </div>
    <span className="fw-bold text-dark dark:text-white fs-5">{value}</span>
  </div>
);

interface ServiceData {
  name: string;
  category: string;
  amount: number;
  bookingsCount: number;
}

interface ServicesTableProps {
  data: ServiceData[];
  totalRevenue: number;
}

const ServicesTable: React.FC<ServicesTableProps> = ({ data, totalRevenue }) => {
  const totalBookings = useMemo(() => 
    data.reduce((total, service) => total + service.bookingsCount, 0), 
    [data]
  );

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr className="border-bottom">
            <th className="border-0 text-muted dark:text-gray-400 fw-semibold py-3">Service Name</th>
            <th className="border-0 text-muted dark:text-gray-400 fw-semibold py-3">Category</th>
            <th className="border-0 text-muted dark:text-gray-400 fw-semibold py-3 text-end">Revenue</th>
            <th className="border-0 text-muted dark:text-gray-400 fw-semibold py-3 text-center">Total Books</th>
            <th className="border-0 text-muted dark:text-gray-400 fw-semibold py-3 text-center">% of Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((service, index) => (
            <tr key={index} className="dark:bg-gray-900">
              <td className="text-dark dark:text-white fw-medium py-3">{service.name}</td>
              <td className="py-3">
                <span className={`badge rounded-pill ${service.category === 'DENTIST' ? 'bg-primary' : 'bg-warning'} px-3 py-2`}>
                  {service.category}
                </span>
              </td>
              <td className="text-end text-dark dark:text-white fw-bold py-3">﷼{service.amount.toLocaleString()}</td>
              <td className="text-center text-muted dark:text-gray-400 py-3">{service.bookingsCount}</td>
              <td className="text-center py-3">
                <span className="badge bg-success rounded-pill px-3 py-2 fw-bold">
                  {totalRevenue ? Math.round((service.amount / totalRevenue) * 100) : 0}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-top">
            <td className="fw-bold text-dark dark:text-white py-3">Total</td>
            <td className="py-3"></td>
            <td className="text-end fw-bold text-dark dark:text-white py-3">﷼{totalRevenue.toLocaleString()}</td>
            <td className="text-center fw-bold text-dark dark:text-white py-3">{totalBookings}</td>
            <td className="text-center py-3">
              <span className="badge bg-success rounded-pill px-3 py-2 fw-bold">100%</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

interface MonthlySalesChartProps {
  options: any;
  series: any[];
}

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ options, series }) => (
  <div className="chart-container">
    <ReactApexChart options={options} series={series} type="bar" height={350} />
  </div>
);

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

interface SalesData {
  totalRevenue: number;
  completedRevenue: number;
  upcomingRevenue: number;
  dentalTotal: number;
  dermatTotal: number;
  serviceBreakdown: ServiceData[];
  monthlySales: { month: string; dental: number; dermatology: number }[];
}

interface BookingData {
  service_discounted_price: string;
  service_actual_price: string;
  booking_status: string;
  service_category_type: string;
  service_name_en: string;
  booking_date: string;
}

const ClinicSalesStatistics = () => {
  // State for tracking time period filter
  const [timeFilter, setTimeFilter] = useState('Monthly');
  const [isLoading, setIsLoading] = useState(true);

  // State for API data
  const [salesData, setSalesData] = useState<SalesData>({
    totalRevenue: 0,
    completedRevenue: 0,
    upcomingRevenue: 0,
    dentalTotal: 0,
    dermatTotal: 0,
    serviceBreakdown: [],
    monthlySales: []
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Replace this with your actual API call
        const response = await get('/booking/service/metric');
        const processedData = processAPIData(response);
        setSalesData(processedData);
        
        // Simulating API call with timeout
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeFilter]);

  // Process API data - memoized to avoid unnecessary recalculations
  const processAPIData = (bookingsData: BookingData[]) => {
    // Initialize collections
    let completedRevenue = 0;
    let upcomingRevenue = 0;
    let dentalTotal = 0;
    let dermatTotal = 0;

    // Service breakdown
    const serviceMap: { [key: string]: ServiceData } = {};

    // Monthly data for chart
    const monthlyMap: { [key: string]: { month: string; dental: number; dermatology: number } } = {};

    // Process each booking
    bookingsData.forEach(booking => {
      const price = parseFloat(booking.service_discounted_price) || parseFloat(booking.service_actual_price);
      const isCompleted = booking.booking_status === "COMPLETED";
      const isDental = booking.service_category_type === "DENTIST";

      // Add to completed or upcoming totals
      if (isCompleted) {
        completedRevenue += price;
      } else if (booking.booking_status === "SCHEDULED") {
        upcomingRevenue += price;
      }

      // Add to service type totals
      if (isDental) {
        dentalTotal += price;
      } else {
        dermatTotal += price;
      }

      // Add to service breakdown
      const serviceKey = booking.service_name_en;
      if (!serviceMap[serviceKey]) {
        serviceMap[serviceKey] = {
          name: serviceKey,
          category: booking.service_category_type,
          amount: 0,
          bookingsCount: 0
        };
      }
      serviceMap[serviceKey].amount += price;
      serviceMap[serviceKey].bookingsCount += 1;

      // Extract month for chart data
      const bookingDate = new Date(booking.booking_date);
      const monthKey = bookingDate.toLocaleString('default', { month: 'short' });

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, dental: 0, dermatology: 0 };
      }

      if (isDental) {
        monthlyMap[monthKey].dental += price;
      } else {
        monthlyMap[monthKey].dermatology += price;
      }
    });

    // Convert service map to array and sort by amount
    const serviceBreakdown = Object.values(serviceMap).sort((a, b) => b.amount - a.amount);

    // Sort months chronologically
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySales = Object.values(monthlyMap).sort((a, b) => 
      monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
    );

    return {
      totalRevenue: completedRevenue + upcomingRevenue,
      completedRevenue,
      upcomingRevenue,
      dentalTotal,
      dermatTotal,
      serviceBreakdown,
      monthlySales
    };
  };

  // Chart options and series are memoized to prevent unnecessary re-renders
  const monthlySalesOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      stacked: true,
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
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: salesData.monthlySales.map(item => item.month),
      labels: {
        style: {
          colors: '#718096',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Sales (SAR)',
        style: { color: '#718096' }
      },
      labels: {
        style: {
          colors: '#718096',
          fontSize: '12px',
        },
        formatter: function (value: number) {
          return '﷼' + value.toLocaleString();
        }
      },
    },
    colors: ['#4C51BF', '#ED8936'],
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '13px',
      markers: { radius: 12 },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return "﷼" + val.toLocaleString();
        }
      }
    }
  }), [salesData.monthlySales]);

  // Memoized chart series
  const monthlySalesSeries = useMemo(() => [
    { name: 'Dental', data: salesData.monthlySales.map(item => item.dental) },
    { name: 'Dermatology', data: salesData.monthlySales.map(item => item.dermatology) }
  ], [salesData.monthlySales]);

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Compute booking conversion
  const bookingConversion = salesData.totalRevenue
    ? Math.round((salesData.completedRevenue / salesData.totalRevenue) * 100)
    : 0;

  return (
    <div className="container-fluid p-4 dark:bg-gray-900">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h2 className="mb-1 fw-bold text-dark dark:text-white d-flex align-items-center gap-2">
                <TrendingUp size={28} />
                Sales Statistics
              </h2>
              <p className="text-muted dark:text-gray-400 mb-0 small">Comprehensive overview of clinic sales performance</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Calendar size={18} className="text-muted dark:text-gray-400" />
              <select
                className="form-select bg-light dark:bg-gray-800 border-0 text-dark dark:text-white shadow-sm"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                style={{ minWidth: '130px' }}
              >
                <option value="Today">Today</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Summary Cards */}
      <div className="row">
        <SalesCard
          title="Total Revenue"
          value={`﷼${salesData.totalRevenue.toLocaleString()}`}
          description="All bookings combined"
          bgColor="bg-primary bg-opacity-10"
          textColor="text-primary"
          icon={<DollarSign size={24} />}
        />
        <SalesCard
          title="Completed"
          value={`﷼${salesData.completedRevenue.toLocaleString()}`}
          description={`${bookingConversion}% booking conversion`}
          bgColor="bg-success bg-opacity-10"
          textColor="text-success"
          icon={<CheckCircle size={24} />}
        />
        <SalesCard
          title="Upcoming"
          value={`﷼${salesData.upcomingRevenue.toLocaleString()}`}
          description="Scheduled appointments"
          bgColor="bg-warning bg-opacity-10"
          textColor="text-warning"
          icon={<Clock size={24} />}
        />
      </div>

      {/* Service Type Summary */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm dark:bg-gray-800">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold text-dark dark:text-white mb-4">Service Type Distribution</h5>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <ServiceTypeIndicator
                    color="#4C51BF"
                    label="Dental Services"
                    value={`﷼${salesData.dentalTotal.toLocaleString()}`}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <ServiceTypeIndicator
                    color="#ED8936"
                    label="Dermatology Services"
                    value={`﷼${salesData.dermatTotal.toLocaleString()}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Sales Chart */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm dark:bg-gray-800">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold text-dark dark:text-white mb-4">Monthly Sales by Service Type</h5>
              <MonthlySalesChart options={monthlySalesOptions} series={monthlySalesSeries} />
            </div>
          </div>
        </div>
      </div>

      {/* Service Earnings Breakdown - Full Width */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm dark:bg-gray-800">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold text-dark dark:text-white mb-4">Service Earnings Breakdown</h5>
              <ServicesTable data={salesData.serviceBreakdown} totalRevenue={salesData.totalRevenue} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicSalesStatistics;