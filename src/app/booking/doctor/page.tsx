"use client";

import React, { useState, useEffect } from 'react';
import { isAfter, isBefore, parseISO, format } from 'date-fns';
import { get, post } from '@/utils/network';
import CancelModal from '../components/CancelModal';
import DoctorDetailsModal from './appoinmentDetailsModal';
import CompleteModal from '../components/CompleteBookingModal';

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
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [completeBookingId, setCompleteBookingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedDateFrom, setSelectedDateFrom] = useState<string>('');
  const [selectedDateTo, setSelectedDateTo] = useState<string>('');
  const [branches, setBranches] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedBooking, setSelectedBooking] = useState<DoctorBooking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);



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
  const handleOpenCompleteModal = (bookingId: string) => {
    setCompleteBookingId(bookingId);
    setCompleteError(null);
    setShowCompleteModal(true);
  }
  

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setCancelBookingId(null);
    setCancelError(null);
  };

  const handleCloseCompleteModal = () => {
    setShowCompleteModal(false);
    setCompleteBookingId(null);
    setCompleteError(null);
  };

  const handleCompleteBooking = async () => {
    if (!completeBookingId) return;

    try {
      setIsCompleting(true);
      setCompleteError(null);

      await post('/booking/doctor/complete', {
        booking_id: completeBookingId,
      });

      handleCloseCompleteModal();
      fetchBookings();
    } catch (error) {
      console.error("Error completing booking:", error);
      setCompleteError((error as Error).message || 'Failed to complete booking');
    } finally {
      setIsCompleting(false);
    }
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

  const handleOpenDetailsModal = (booking: DoctorBooking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
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
                  "Final Total",
                  "View Details",
                ].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className={
                      ["Final Total"].includes(header)
                        ? "text-end fw-semibold small"
                        : "fw-semibold small"
                    }
                    style={{
                      padding: "12px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
                {showActions && (
                  <th
                    scope="col"
                    className="text-center fw-semibold small"
                    style={{ padding: "12px 16px" }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* ================= BODY ================= */}
            <tbody>
              {bookings.map((booking) => {
                return (
                  <tr 
                    key={booking.id} 
                    className="align-middle border-bottom"
                    style={{ transition: 'transform 0.2s ease-in-out', cursor: 'pointer' }}
                    >
                    {/* Order ID */}
                    <td className="fw-medium small" style={{ padding: "12px 16px" }}>
                      {booking.id}
                    </td>

                    {/* Customer */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ lineHeight: "1.4" }}>
                        <div className="fw-semibold small">
                          {booking.user_full_name}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.8125rem" }}>
                          {booking.user_email}
                        </div>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="fw-medium small" style={{ padding: "12px 16px" }}>
                      {booking.doctor_name_en}
                    </td>

                    {/* Date */}
                    <td
                      className="small"
                      style={{
                        padding: "12px 16px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(booking.booking_date)}
                    </td>

                    {/* Branch */}
                    <td className="small" style={{ padding: "12px 16px" }}>
                      {booking.branch_name_en}
                    </td>

                    {/* Final Total */}
                    <td
                      className="text-end fw-semibold small"
                      style={{ padding: "12px 16px" }}
                    >
                      ﷼{booking.final_total || "0.00"}
                    </td>

                    {/* View details */}
                    <td
                      className="text-end fw-semibold small"
                      style={{ padding: "12px 16px" }}
                    >
                      <button
                        onClick={() => handleOpenDetailsModal(booking)}
                        className="btn btn-outline-primary btn-sm px-3"
                      >
                        View Details
                      </button>
                    </td>

                    {/* Actions */}
                    {showActions && (
                      <td
                        className="text-center"
                        style={{ padding: "12px" }}
                      >
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            onClick={() =>
                              handleOpenCancelModal(booking.id)
                            }
                            className="btn btn-outline-danger btn-sm px-3"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              handleOpenCompleteModal(booking.id)
                            }
                            className="btn btn-success btn-sm px-3"
                          >
                            Complete
                          </button>
                        </div>
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
    <div className="w-full border rounded p-4">
      <h5 className="mb-4 fw-semibold">
        Doctor Bookings
      </h5>

      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            onClick={() => setMainTab("completed")}
            className={`nav-link d-flex align-items-center gap-2 ${
              mainTab === "completed" ? "active" : ""
            }`}
            type="button"
            role="tab"
            aria-selected={mainTab === "completed"}
          >
            <span className="fw-semibold">Completed</span>
            <span className={`badge rounded-pill ${
              mainTab === "completed" ? "bg-primary text-white" : "bg-secondary"
            }`}>
              {completedBookings.length}
            </span>
          </button>
        </li>

        <li className="nav-item" role="presentation">
          <button
            onClick={() => setMainTab("upcoming")}
            className={`nav-link d-flex align-items-center gap-2 ${
              mainTab === "upcoming" ? "active" : ""
            }`}
            type="button"
            role="tab"
            aria-selected={mainTab === "upcoming"}
          >
            <span className="fw-semibold">Upcoming</span>
            <span className={`badge rounded-pill ${
              mainTab === "upcoming" ? "bg-primary text-white" : "bg-secondary"
            }`}>
              {upcomingBookings.length}
            </span>
          </button>
        </li>

        <li className="nav-item" role="presentation">
          <button
            onClick={() => setMainTab("canceled")}
            className={`nav-link d-flex align-items-center gap-2 ${
              mainTab === "canceled" ? "active" : ""
            }`}
            type="button"
            role="tab"
            aria-selected={mainTab === "canceled"}
          >
            <span className="fw-semibold">Canceled</span>
            <span className={`badge rounded-pill ${
              mainTab === "canceled" ? "bg-primary text-white" : "bg-secondary"
            }`}>
              {canceledBookings.length}
            </span>
          </button>
        </li>
      </ul>

      {/* Search and Filter Section */}
      <div className="mb-4 p-3 bg-body-secondary rounded">
        <div className="row g-3">
          {/* Search Input */}
          <div className="col-md-6 col-lg-4">
            <label className="form-label fw-semibold small">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, phone, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Branch Filter */}
          <div className="col-md-6 col-lg-3">
            <label className="form-label fw-semibold small">Branch</label>
            <select
              className="form-select"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="all">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="col-md-6 col-lg-2">
            <label className="form-label fw-semibold small">Date From</label>
            <input
              type="date"
              className="form-control"
              value={selectedDateFrom}
              onChange={(e) => setSelectedDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="col-md-6 col-lg-2">
            <label className="form-label fw-semibold small">Date To</label>
            <input
              type="date"
              className="form-control"
              value={selectedDateTo}
              onChange={(e) => setSelectedDateTo(e.target.value)}
            />
          </div>

          {/* Clear Filters Button */}
          <div className="col-md-12 col-lg-1 d-flex align-items-end">
            <button
              onClick={clearFilters}
              className="btn btn-outline-secondary w-100 small"
              title="Clear all filters"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      {renderBookingTable(getCurrentBookings(), mainTab === 'upcoming')}

      <CancelModal
        show={showCancelModal}
        isCancelling={isCancelling}
        error={cancelError}
        onClose={handleCloseCancelModal}
        onConfirm={handleCancelBooking}
      />
      
      <CompleteModal
        show={showCompleteModal}
        isCompleting={isCompleting}
        error={completeError}
        onClose={handleCloseCompleteModal}
        onConfirm={handleCompleteBooking}
      />


      <DoctorDetailsModal
        show={showDetailsModal}
        booking={selectedBooking}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
};

export default DoctorBookingsPage;
