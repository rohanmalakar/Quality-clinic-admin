"use client";

import React, { useState, useEffect } from 'react';
import { isAfter, isBefore, parseISO, format } from 'date-fns';
import { get, post } from '@/utils/network';
import CancelModal from '../components/CancelModal';

interface DoctorBooking {
  id: string;
  user_id: number | null;
  doctor_id?: number;
  type: string;
  user_full_name: string;
  user_phone_number: string;
  user_email: string;
  branch_id: number;
  branch_name_en: string;
  branch_name_ar: string;
  time_slot_id: number;
  time_slot_start_time: string;
  time_slot_end_time: string;
  booking_date: string;
  booking_status: string;
  actual_price?: string;
  discounted_price?: string;
  vat_percentage: string;
  vat_amount?: string;
  final_total?: string;
  doctor_name_en: string;
}

const DoctorBookingsPage: React.FC = () => {
  const [completedBookings, setCompletedBookings] = useState<DoctorBooking[]>([]);
  const [canceledBookings, setCanceledBookings] = useState<DoctorBooking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<DoctorBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mainTab, setMainTab] = useState<'completed' | 'upcoming' | 'canceled'>('completed');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedDateFrom, setSelectedDateFrom] = useState<string>('');
  const [selectedDateTo, setSelectedDateTo] = useState<string>('');
  const [branches, setBranches] = useState<Array<{ id: number; name: string }>>([]);


  const processBookings = (bookings: DoctorBooking[]): DoctorBooking[] => {
    return bookings.map(booking => {
      if (booking.vat_percentage === "") return booking;
      const vatRate = parseFloat(booking.vat_percentage);
      const discountedPrice = parseFloat(booking.discounted_price || '0');
      const vatAmount = (discountedPrice * (vatRate / 100)).toFixed(2);
      const finalTotal = (discountedPrice * (1 + vatRate / 100)).toFixed(2);
      return { ...booking, vat_amount: vatAmount, final_total: finalTotal };
    });
  };

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const doctorData: DoctorBooking[] = await get('/booking/doctor/metric');
      const processedData = processBookings(doctorData);
      const currentDate = new Date();

      const completed = processedData.filter(booking =>
        isBefore(parseISO(booking.booking_date), currentDate) ||
        booking.booking_status === "COMPLETED"
      );

      const upcoming = processedData.filter(booking =>
        isAfter(parseISO(booking.booking_date), currentDate) &&
        booking.booking_status !== "COMPLETED" &&
        booking.booking_status !== "CANCELED"
      );

      const canceled = processedData.filter(booking =>
        booking.booking_status === "CANCELED"
      );

      setCompletedBookings(completed);
      setUpcomingBookings(upcoming);
      setCanceledBookings(canceled);

      // Extract unique branches
      const uniqueBranches = Array.from(
        new Set(processedData.map(b => JSON.stringify({ id: b.branch_id, name: b.branch_name_en })))
      ).map(str => JSON.parse(str));
      setBranches(uniqueBranches);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching doctor bookings:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenCancelModal = (bookingId: string) => {
    setCancelBookingId(bookingId);
    setCancelError(null);
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setCancelBookingId(null);
    setCancelError(null);
  };

  const handleCancelBooking = async () => {
    if (!cancelBookingId) return;

    try {
      setIsCancelling(true);
      setCancelError(null);

      await post('/booking/doctor/cancel', {
        booking_id: cancelBookingId,
      });

      handleCloseCancelModal();
      fetchBookings();
      alert('Doctor booking canceled successfully');
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setCancelError((error as Error).message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const exportToCSV = (bookings: DoctorBooking[], filename: string) => {
    const headers = [
      'Order ID', 'Customer Name', 'Customer Email', 'Doctor Name',
      'Branch Name', 'Date', 'Total Amount', 'Discount Amount', 'VAT Amount', 'Final Total'
    ];

    const rows = bookings.map(booking => {
      const discountAmount = booking.actual_price && booking.discounted_price
        ? (parseFloat(booking.actual_price) - parseFloat(booking.discounted_price)).toFixed(2)
        : "0.00";

      return [
        booking.id, booking.user_full_name, booking.user_email,
        booking.doctor_name_en, booking.branch_name_en,
        booking.booking_date, booking.actual_price || "0",
        discountAmount, booking.vat_amount || "0.00", booking.final_total || "0.00"
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date: string) => {
    return format(parseISO(date), 'MMM dd, yyyy');
  };

  const renderBookingTable = (
    bookings: DoctorBooking[],
    showActions: boolean = false
  ) => {
    if (bookings.length === 0) {
      return (
        <div className="text-center py-4 text-muted">
          No doctor bookings found.
        </div>
      );
    }

    return (
      <div style={{ width: "100%", overflowX: "auto" }}>
        <div className="border rounded">
          <table style={{ minWidth: '100%', width: '100%', borderCollapse: 'collapse' }} className="table table-hover  bordered-table sm-table mb-0">
            {/* ================= HEADER ================= */}
            <thead>
              <tr className="border-bottom">
                {[
                  "Order ID",
                  "Customer",
                  "Doctor",
                  "Date",
                  "Branch",
                  "Total Amount",
                  "Discount",
                  "VAT",
                  "Final Total",
                ].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className={
                      [
                        "Total Amount",
                        "Discount",
                        "VAT",
                        "Final Total",
                      ].includes(header)
                        ? "text-end fw-semibold"
                        : "fw-semibold"
                    }
                    style={{
                      fontSize: "13px",
                      padding: "12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
                {showActions && (
                  <th
                    scope="col"
                    className="text-center fw-semibold"
                    style={{ fontSize: "13px", padding: "12px" }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* ================= BODY ================= */}
            <tbody>
              {bookings.map((booking) => {
                const discountAmount =
                  booking.actual_price && booking.discounted_price
                    ? (
                      parseFloat(booking.actual_price) -
                      parseFloat(booking.discounted_price)
                    ).toFixed(2)
                    : "0.00";

                return (
                  <tr 
                    key={booking.id} 
                    className="align-middle border-bottom"
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    style={{ transition: 'transform 0.2s ease-in-out', cursor: 'pointer' }}
                    >
                    {/* Order ID */}
                    <td className="fw-medium" style={{ padding: "12px" }}>
                      {booking.id}
                    </td>

                    {/* Customer */}
                    <td style={{ padding: "12px" }}>
                      <div style={{ lineHeight: "1.3" }}>
                        <div className="fw-semibold">
                          {booking.user_full_name}
                        </div>
                        <div className="small ">
                          {booking.user_email}
                        </div>
                        <div className="small ">
                          {booking.user_phone_number}
                        </div>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="fw-medium" style={{ padding: "12px" }}>
                      {booking.doctor_name_en}
                    </td>

                    {/* Date */}
                    <td
                      style={{
                        padding: "12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(booking.booking_date)}
                    </td>

                    {/* Branch */}
                    <td style={{ padding: "12px" }}>
                      {booking.branch_name_en}
                    </td>

                    {/* Total Amount */}
                    <td
                      className="text-end fw-medium"
                      style={{ padding: "12px" }}
                    >
                      ﷼{booking.actual_price || "0.00"}
                    </td>

                    {/* Discount */}
                    <td
                      className="text-end "
                      style={{ padding: "12px" }}
                    >
                      ﷼{discountAmount}
                    </td>

                    {/* VAT */}
                    <td className="text-end" style={{ padding: "12px" }}>
                      <div style={{ fontSize: "13px" }}>
                        {booking.vat_percentage || 15}%
                      </div>
                      <div className="small">
                        (﷼{booking.vat_amount || "0.00"})
                      </div>
                    </td>

                    {/* Final Total */}
                    <td
                      className="text-end fw-semibold"
                      style={{ padding: "12px" }}
                    >
                      ﷼{booking.final_total || "0.00"}
                    </td>

                    {/* Actions */}
                    {showActions && (
                      <td
                        className="text-center"
                        style={{ padding: "12px" }}
                      >
                        <button
                          onClick={() =>
                            handleOpenCancelModal(booking.id)
                          }
                          className="btn btn-outline-danger btn-sm px-3"
                        >
                          Cancel
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };


  if (isLoading) {
    return <div className="text-center py-3">Loading doctor bookings...</div>;
  }

  const applyFilters = (bookings: DoctorBooking[]) => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.user_full_name?.toLowerCase().includes(term) ||
        booking.user_email?.toLowerCase().includes(term) ||
        booking.user_phone_number?.toLowerCase().includes(term) ||
        booking.doctor_name_en?.toLowerCase().includes(term)
      );
    }

    // Branch filter
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(booking => booking.branch_id === parseInt(selectedBranch));
    }

    // Date range filter
    if (selectedDateFrom) {
      filtered = filtered.filter(booking =>
        new Date(booking.booking_date) >= new Date(selectedDateFrom)
      );
    }
    if (selectedDateTo) {
      filtered = filtered.filter(booking =>
        new Date(booking.booking_date) <= new Date(selectedDateTo)
      );
    }

    return filtered;
  };

  const getCurrentBookings = () => {
    let bookings: DoctorBooking[] = [];
    switch (mainTab) {
      case 'completed':
        bookings = completedBookings;
        break;
      case 'upcoming':
        bookings = upcomingBookings;
        break;
      case 'canceled':
        bookings = canceledBookings;
        break;
      default:
        bookings = completedBookings;
    }
    return applyFilters(bookings);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBranch('all');
    setSelectedDateFrom('');
    setSelectedDateTo('');
  };

  return (
    <div className="w-full border p-6 radius-8">
      <h6 className="" >
        Doctor Bookings
      </h6>

      <div className="mb-4 border-bottom" style={{ borderColor: "var(--bs-border-color)" }}>
        <div className="d-flex gap-2 py-3 flex-wrap">
          <button
            onClick={() => setMainTab("completed")}
            className={`btn btn-sm px-6 rounded-4 py-4 fw-semibold d-flex align-items-center gap-2  ${mainTab === "completed"
                ? "text-primary border-3 border-primary"
                : "text-secondary"
              }`}
            style={{ background: "transparent", borderRadius: 0 }}
          >
            Completed
            <span className={`badge rounded-pill ${mainTab === "completed" ? "bg-primary text-white" : "bg-secondary-subtle text-secondary"
              }`}>
              {completedBookings.length}
            </span>
          </button>

          <button
            onClick={() => setMainTab("upcoming")}
            className={`btn btn-sm px-6 rounded-4 py-4 fw-semibold d-flex align-items-center gap-2  ${mainTab === "upcoming"
                ? "text-primary  border-3 border-primary"
                : "text-secondary"
              }`}
            style={{ background: "transparent", borderRadius: 0 }}
          >
            Upcoming
            <span className={`badge rounded-pill ${mainTab === "upcoming" ? "bg-primary text-white" : "bg-secondary-subtle text-secondary"
              }`}>
              {upcomingBookings.length}
            </span>
          </button>

          <button
            onClick={() => setMainTab("canceled")}
            className={`btn btn-sm px-6 rounded-4 py-4 fw-semibold d-flex align-items-center gap-2 ${mainTab === "canceled"
                ? "text-primary  border-3 border-primary"
                : "text-secondary"
              }`}
            style={{ background: "transparent", borderRadius: 0 }}
          >
            Canceled
            <span className={`badge rounded-pill ${mainTab === "canceled" ? "bg-primary text-white" : "bg-secondary-subtle text-secondary"
              }`}>
              {canceledBookings.length}
            </span>
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-4 p-3">
        <div className="row g-3">
          {/* Search Input */}
          <div className="col-md-6 col-lg-4">
            <label className="form-label fw-semibold" style={{ fontSize: '14px' }}>Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, phone, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '14px' }}
            />
          </div>

          {/* Branch Filter */}
          <div className="col-md-6 col-lg-3">
            <label className="form-label fw-semibold" style={{ fontSize: '14px' }}>Branch</label>
            <select
              className="form-select"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{ fontSize: '14px' }}
            >
              <option value="all">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="col-md-6 col-lg-2">
            <label className="form-label fw-semibold" style={{ fontSize: '14px' }}>Date From</label>
            <input
              type="date"
              className="form-control"
              value={selectedDateFrom}
              onChange={(e) => setSelectedDateFrom(e.target.value)}
              style={{ fontSize: '14px' }}
            />
          </div>

          {/* Date To */}
          <div className="col-md-6 col-lg-2">
            <label className="form-label fw-semibold" style={{ fontSize: '14px' }}>Date To</label>
            <input
              type="date"
              className="form-control"
              value={selectedDateTo}
              onChange={(e) => setSelectedDateTo(e.target.value)}
              style={{ fontSize: '14px' }}
            />
          </div>

          {/* Clear Filters Button */}
          <div className="col-md-12 col-lg-1 d-flex align-items-end">
            <button
              onClick={clearFilters}
              className="btn btn-outline-secondary w-100"
              style={{ fontSize: '14px' }}
              title="Clear all filters"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* <div className="mb-3">
        {getCurrentBookings().length > 0 && (
          <button
            onClick={() => exportToCSV(getCurrentBookings(), `doctor-bookings-${mainTab}`)}
            style={{
              border: 'none',
              background: '#6b46c1',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download CSV
          </button>
        )}
      </div> */}

      {renderBookingTable(getCurrentBookings(), mainTab === 'upcoming')}

      <CancelModal
        show={showCancelModal}
        isCancelling={isCancelling}
        error={cancelError}
        onClose={handleCloseCancelModal}
        onConfirm={handleCancelBooking}
      />
    </div>
  );
};

export default DoctorBookingsPage;
