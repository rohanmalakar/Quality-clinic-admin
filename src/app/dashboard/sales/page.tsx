"use client";
import { useState, useEffect, useMemo } from 'react';
import dynamic from "next/dynamic";
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
}

// Separate components for better code organization and optimization
const SalesCard: React.FC<SalesCardProps> = ({ title, value, description, bgColor, textColor }) => (
  <div className="col-md-3">
    <div className={`card ${bgColor} border-0 h-100`}>
      <div className="card-body">
        <h6 className={`${textColor} mb-2`}>{title}</h6>
        <h3 className="fw-bold mb-0">{value}</h3>
        <small className="text-muted">{description}</small>
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
  <li className="d-flex align-items-center gap-2">
    <span className={`w-12-px h-12-px rounded-circle ${color}`} />
    <span className="text-secondary-light fw-semibold">
      {label}:
      <span className="text-primary-light fw-bold ms-1">{value}</span>
    </span>
  </li>
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
    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <table className="table table bordered-table sm-table mb-0 table-hover">
        <thead className=" sticky-top">
          <tr>
            <th scope="col">Service Name</th>
            <th scope="col">Category</th>
            <th scope="col" className="text-end">Revenue</th>
            <th scope="col" className="text-end">Total Books</th>
            <th scope="col" className="text-end">% of Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((service, index) => (
            <tr key={index}>
              <td>
                <span className="fw-semibold">{service.name}</span>
              </td>
              <td>
                <span className={`badge ${service.category === 'DENTIST' ? 'bg-primary-100 text-primary-800' : 'bg-warning-100 text-warning-800'}`}>
                  {service.category}
                </span>
              </td>
              <td className="text-end">﷼{service.amount.toLocaleString()}</td>
              <td className="text-end">{service.bookingsCount}</td>
              <td className="text-end">
                {totalRevenue ? Math.round((service.amount / totalRevenue) * 100) : 0}%
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="sticky-bottom">
          <tr>
            <td colSpan={2} className="fw-bold">Total</td>
            <td className="text-end fw-bold">﷼{totalRevenue.toLocaleString()}</td>
            <td className="text-end fw-bold">{totalBookings}</td>
            <td className="text-end fw-bold">100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

interface MonthlySalesChartProps {
  options: any; // Define more specific types if possible
  series: any[]; // Define more specific types if possible
}

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ options, series }) => (
  <div id="monthlySalesChart">
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={400}
    />
  </div>
);

const LoadingSpinner = () => (
  <div className="row">
    <div className="col-12">
      <div className="card">
        <div className="card-body d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
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
        const response = await get('/booking/service/metric');
        const processedData = processAPIData(response);
        setSalesData(processedData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
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
    const serviceMap: { [key: string]: ServiceData }  = {};
    
    // Monthly data for chart
    const monthlyMap:  { [key: string]: { month: string; dental: number; dermatology: number } } = {};
    
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
        monthlyMap[monthKey] = {
          month: monthKey,
          dental: 0,
          dermatology: 0
        };
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
      toolbar: {
        show: false
      },
      fontFamily: 'Inter, sans-serif',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 5,
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
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
        text: 'Sales (USD)',
        style: {
          color: '#718096',
        }
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
      markers: {
        radius: 12,
      },
    },
    fill: {
      opacity: 1
    },
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
    {
      name: 'Dental',
      data: salesData.monthlySales.map(item => item.dental)
    },
    {
      name: 'Dermatology',
      data: salesData.monthlySales.map(item => item.dermatology)
    }
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
    <div className="row g-3">
      {/* Total Sales Statistics */}
      <div className="col-md-12">
        <div className="card h-100">
          <div className="card-body">
            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between mb-4">
              <h6 className="fw-bold text-lg mb-0">Sales Statistics</h6>
              <select 
                className="form-select form-select-sm w-auto bg-base border text-secondary-light"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="Daily">Today</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            {/* Sales Summary Boxes */}
            <div className="row g-3 mb-4">
              <SalesCard 
                title="Total Sales" 
                value={`﷼${salesData.totalRevenue.toLocaleString()}`} 
                description="Combined Revenue" 
                bgColor="bg-primary-50" 
                textColor="text-primary-600" 
              />
              <SalesCard 
                title="Completed Bookings" 
                value={`﷼${salesData.completedRevenue.toLocaleString()}`} 
                description="From COMPLETED status" 
                bgColor="bg-success-50" 
                textColor="text-success-600" 
              />
              <SalesCard 
                title="Upcoming Bookings" 
                value={`﷼${salesData.upcomingRevenue.toLocaleString()}`} 
                description="From SCHEDULED status" 
                bgColor="bg-warning-50" 
                textColor="text-warning-600" 
              />
              <SalesCard 
                title="Booking Conversion" 
                value={`${bookingConversion}%`} 
                description="Completed vs Total" 
                bgColor="bg-info-50" 
                textColor="text-info-600" 
              />
            </div>

            {/* Service Type Summary */}
            <div className="d-flex align-items-center justify-content-center mb-4">
              <ul className="d-flex flex-wrap align-items-center gap-4 mb-0">
                <ServiceTypeIndicator 
                  color="bg-primary-600" 
                  label="Dental" 
                  value={`﷼${salesData.dentalTotal.toLocaleString()}`} 
                />
                <ServiceTypeIndicator 
                  color="bg-warning-500" 
                  label="Dermatology" 
                  value={`﷼${salesData.dermatTotal.toLocaleString()}`} 
                />
              </ul>
            </div>

            {/* Monthly Sales Chart and Service Breakdown - Side by Side */}
            <div className="row g-3 mt-2">
              {/* Monthly Sales Chart */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Monthly Sales by Service Type</h6>
                    <MonthlySalesChart 
                      options={monthlySalesOptions} 
                      series={monthlySalesSeries} 
                    />
                  </div>
                </div>
              </div>
              {/* Service Earnings Breakdown */}
            </div>
            <div className="row g-3 mt-2">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Service Earnings Breakdown</h6>
                  <ServicesTable 
                    data={salesData.serviceBreakdown} 
                    totalRevenue={salesData.totalRevenue} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicSalesStatistics;