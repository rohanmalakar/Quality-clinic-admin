"use client";

import React from 'react';
import { User, Mail, Phone, CreditCard, MapPin, Calendar, Clock, DollarSign, Tag, Package, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ServiceBooking {
  id: string;
  user_id: number | null;
  service_id?: number;
  type: string;
  user_full_name: string;
  user_phone_number: string;
  user_email: string;
  branch_id: number;
  branch_name_en: string;
  branch_name_ar: string;
  booking_date: string;
  booking_status: string;
  service_actual_price?: string;
  service_discounted_price?: string;
  vat_percentage: string;
  vat_amount?: string;
  final_total?: string;
  service_name_en: string;
}

interface ServiceDetailsModalProps {
  show: boolean;
  booking: ServiceBooking | null;
  onClose: () => void;
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({ show, booking, onClose }) => {
  if (!show || !booking) return null;

  const formatDate = (date: string) => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return date;
    }
  };

  const formatTime = (date: string) => {
    try {
      const d = new Date(date);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const discountAmount = booking.service_actual_price && booking.service_discounted_price
    ? (parseFloat(booking.service_actual_price) - parseFloat(booking.service_discounted_price)).toFixed(2)
    : "0.00";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { 
          color: 'success',
          bgClass: 'bg-success-subtle text-success border-success',
          icon: <CheckCircle size={16} />,
          text: 'Completed'
        };
      case 'SCHEDULED':
        return { 
          color: 'primary',
          bgClass: 'bg-primary-subtle text-primary border-primary',
          icon: <Clock size={16} />,
          text: 'Scheduled'
        };
      case 'CANCELED':
        return { 
          color: 'danger',
          bgClass: 'bg-danger-subtle text-danger border-danger',
          icon: <XCircle size={16} />,
          text: 'Canceled'
        };
      default:
        return { 
          color: 'secondary',
          bgClass: 'bg-secondary-subtle text-secondary border-secondary',
          icon: <AlertCircle size={16} />,
          text: status
        };
    }
  };

  const statusConfig = getStatusConfig(booking.booking_status);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`modal-backdrop fade ${show ? 'show' : ''}`}
        style={{
          display: show ? 'block' : 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }}
      />

      {/* Modal */}
      <div
        className={`modal fade ${show ? 'show' : ''}`}
        style={{
          display: show ? 'block' : 'none',
        }}
        tabIndex={-1}
      >
        <div className="modal-dialog  modal-dialog-centered modal-dialog-scrollable modal-xl">
          <div className="modal-content border-0  shadow-lg">
            {/* Modal Header with Gradient */}
            <div className="modal-header ml-6  border-0 text-white position-relative " style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <div>
                <h3 className="modal-title fw-bold mb-2 h4">Service Booking Details</h3>
                <p className="mb-0 opacity-75 small">Order ID: {booking.id}</p>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Close"
              />
            </div>

            {/* Modal Body */}
            <div className="modal-body  bg-body-secondary" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Status Badge */}
              <div className="mb-4">
                <span className={`badge ${statusConfig.bgClass} border d-inline-flex align-items-center gap-2 fw-semibold py-3 my-3 text-xl px-3 fs-4`}>
                  {statusConfig.icon}
                  {statusConfig.text}
                </span>
              </div>

              {/* Main Content Grid */}
              <div className="row g-4">
                {/* Customer Information */}
                <div className="col-12 col-lg-6">
                  <div className="card h-100 border-0 p-3 shadow-sm hover-shadow-lg transition bg-body">
                    <div className="card-body p-4">
                      <h5 className="card-title py-3 d-flex align-items-center gap-2 mb-4 h6">
                        <div className="bg-primary  bg-opacity-10 p-8 rounded">
                          <User size={20} className="text-primary" />
                        </div>
                        <span 
                        style={{"color":"black"}}
                        className="fw-semibold  fs-4">Customer Information</span>
                      </h5>
                      
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex gap-3">
                          <User size={20} className="text-muted mt-1" style={{ flexShrink: 0 }} />
                          <div className="flex-grow-1">
                            <label className="text-muted text-uppercase mb-1 d-block fw-medium small" style={{ letterSpacing: '0.5px' }}>Full Name</label>
                            <p className="mb-0 fw-semibold text-body fw-semibold fs-4">{booking.user_full_name}</p>
                          </div>
                        </div>
                        
                        <div className="d-flex gap-3">
                          <Mail size={20} className="text-muted mt-1" style={{ flexShrink: 0 }} />
                          <div className="flex-grow-1">
                            <label className="text-muted text-uppercase mb-1 d-block fw-medium small" style={{ letterSpacing: '0.5px' }}>Email Address</label>
                            <p className="mb-0 fw-semibold text-body fw-semibold fs-5">{booking.user_email}</p>
                          </div>
                        </div>
                        
                        <div className="d-flex gap-3">
                          <Phone size={20} className="text-muted mt-1" style={{ flexShrink: 0 }} />
                          <div className="flex-grow-1">
                            <label className="text-muted text-uppercase mb-1 d-block fw-medium small" style={{ letterSpacing: '0.5px' }}>Phone Number</label>
                            <p className="mb-0 fw-semibold text-body fw-semibold fs-4">{booking.user_phone_number}</p>
                          </div>
                        </div>
                        
                        {booking.user_id && (
                          <div className="d-flex gap-3">
                            <CreditCard size={20} className="text-muted mt-1" style={{ flexShrink: 0 }} />
                            <div className="flex-grow-1">
                              <label className="text-muted text-uppercase mb-1 d-block fw-medium small" style={{ letterSpacing: '0.5px' }}>Customer ID</label>
                              <p className="mb-0 fw-semibold text-body fw-semibold fs-4">{booking.user_id}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Information */}
                <div className="col-12 col-lg-6">
                  <div className="card h-100 border-0 p-3 shadow-sm hover-shadow-lg transition bg-body">
                    <div className="card-body p-4">
                      <h5 className="card-title py-3 d-flex align-items-center gap-2 mb-4 h6">
                        <div className="bg-info bg-opacity-10 p-8 rounded">
                          <Package size={20} className="text-info" />
                        </div>
                        <span 
                        style={{"color":"black"}}
                        className="fw-semibold fs-3">Service Information</span>
                      </h5>
                      
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex gap-3">
                          <Package size={20} className="text-muted mt-1" style={{ flexShrink: 0 }} />
                          <div className="flex-grow-1">
                            <label className="text-muted text-uppercase mb-1 d-block fw-medium small" style={{ letterSpacing: '0.5px' }}>Service Name</label>
                            <p className="mb-0 fw-semibold text-body fw-semibold fs-4">{booking.service_name_en}</p>
                          </div>
                        </div>
                        
                        {booking.service_id && (
                          <div className="d-flex gap-3">
                            <Tag size={20} className="text-muted mt-1" style={{ flexShrink: 0 }} />
                            <div className="flex-grow-1">
                              <label className="text-muted text-uppercase mb-1 d-block fw-medium small" style={{ letterSpacing: '0.5px' }}>Service ID</label>
                              <p className="mb-0 fw-semibold text-body fw-semibold fs-4">{booking.service_id}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="d-flex gap-3">
                          <AlertCircle size={20} className="text-muted mt-1" style={{ flexShrink: 0 }} />
                          <div className="flex-grow-1">
                            <label className="text-muted text-uppercase mb-1 d-block fw-medium small" style={{ letterSpacing: '0.5px' }}>Booking Type</label>
                            <p className="mb-0 fw-semibold text-body fw-semibold fs-4">{booking.type}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Branch & Date Information */}
                <div className="col-12 col-lg-6">
                  <div className="card h-100 border-0 p-3 shadow-sm hover-shadow-lg transition bg-body">
                    <div className="card-body p-4">
                      <h5 className="card-title py-3 d-flex align-items-center gap-2 mb-4 h6">
                        <div className="bg-success bg-opacity-10 p-8 rounded">
                          <MapPin size={20} className="text-success" />
                        </div>
                        <span 
                        style={{"color":"black"}}
                        className="fw-semibold fs-4">Branch & Schedule</span>
                      </h5>
                      
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex gap-3">
                          <MapPin size={20} className="text-muted mt-1" style={{ flexShrink: 0 }} />
                          <div className="flex-grow-1">
                            <label className="text-muted text-uppercase mb-1 d-block fw-medium small" style={{ letterSpacing: '0.5px' }}>Branch Name (English)</label>
                            <p className="mb-0 fw-semibold text-body fw-semibold fs-4">{booking.branch_name_en}</p>
                          </div>
                        </div>
                        
                        <div className="d-flex gap-3">
                          <MapPin size={20} className="text-muted mt-1" style={{ flexShrink: 0 }} />
                          <div className="flex-grow-1">
                            <label className="text-muted text-uppercase mb-1 d-block fw-medium small" style={{ letterSpacing: '0.5px' }}>Branch Name (Arabic)</label>
                            <p className="mb-0 fw-semibold text-body fw-semibold fs-4">{booking.branch_name_ar}</p>
                          </div>
                        </div>
                        
                        <div className="d-flex gap-3">
                          <Tag size={20} className="text-muted mt-1" style={{ flexShrink: 0 }} />
                          <div className="flex-grow-1">
                            <label className="text-muted text-uppercase mb-1 d-block fw-medium small" style={{ letterSpacing: '0.5px' }}>Branch ID</label>
                            <p className="mb-0 fw-semibold text-body fw-semibold fs-4">{booking.branch_id}</p>
                          </div>
                        </div>
                        
                        <div className="d-flex gap-3">
                          <Calendar size={20} className="text-muted mt-1" style={{ flexShrink: 0 }} />
                          <div className="flex-grow-1">
                            <label className="text-muted text-uppercase mb-1 d-block fw-medium small" style={{ letterSpacing: '0.5px' }}>Booking Date & Time</label>
                            <p className="mb-0 fw-semibold text-body fw-semibold fs-4">{formatDate(booking.booking_date)}</p>
                            <p className="mb-0 text-muted d-flex align-items-center gap-1 mt-1 small">
                              <Clock size={14} />
                              {formatTime(booking.booking_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="col-12 col-lg-6">
                  <div className="card h-100 border-0 p-3 shadow-sm hover-shadow-lg transition bg-warning bg-opacity-10">
                    <div className="card-body p-4">
                      <h5 className="card-title py-3 d-flex align-items-center gap-2 mb-4 h6">
                        <div className="bg-warning bg-opacity-25 p-8 rounded">
                          <DollarSign size={20} className="text-warning-emphasis" />
                        </div>
                        <span 
                        style={{"color":"black"}}
                        className="fw-semibold fs-4">Pricing Details</span>
                      </h5>
                      
                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex justify-content-between align-items-center pb-2 border-bottom border-warning border-opacity-25">
                          <span className="text-body d-flex align-items-center gap-2 fs-6">
                            <Tag size={16} />
                            Original Price
                          </span>
                          <span className="fw-semibold text-body fs-6">﷼{booking.service_actual_price || '0.00'}</span>
                        </div>
                        
                        {parseFloat(discountAmount) > 0 && (
                          <>
                            <div className="d-flex justify-content-between align-items-center pb-2 border-bottom border-warning border-opacity-25">
                              <span className="text-body d-flex align-items-center gap-2 fs-6">
                                <Tag size={16} />
                                Discount
                              </span>
                              <span className="fw-semibold text-success fs-6">-﷼{discountAmount}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center pb-2 border-bottom border-warning border-opacity-25">
                              <span className="text-body d-flex align-items-center gap-2 fs-6">
                                <Tag size={16} />
                                Discounted Price
                              </span>
                              <span className="fw-semibold text-body fs-6">﷼{booking.service_discounted_price || '0.00'}</span>
                            </div>
                          </>
                        )}
                        
                        <div className="d-flex justify-content-between align-items-center pb-2 border-bottom border-warning border-opacity-25">
                          <span className="text-body d-flex align-items-center gap-2 fs-6">
                            <DollarSign size={16} />
                            VAT ({booking.vat_percentage || '15'}%)
                          </span>
                          <span className="fw-semibold text-body fs-6">﷼{booking.vat_amount || '0.00'}</span>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center pt-3 mt-2 bg-body rounded p-3">
                          <span className="fw-bold fs-5 d-flex align-items-center gap-2">
                            <DollarSign size={20} />
                            Final Total
                          </span>
                          <span className="fw-bold text-primary fs-3">
                            ﷼{booking.final_total || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top bg-body py-3 px-4">
              <button
                type="button"
                className="btn btn-secondary px-4 py-2"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hover-shadow-lg {
          transition: all 0.3s ease;
        }
        .hover-shadow-lg:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </>
  );
};

export default ServiceDetailsModal;