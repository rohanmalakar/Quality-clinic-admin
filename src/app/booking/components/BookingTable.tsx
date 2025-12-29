import React from 'react';
import { format, parseISO } from 'date-fns';

interface BookingTableProps {
  bookings: any[];
  type: 'upcoming' | 'completed';
  onCancel?: (bookingId: string) => void;
  showCanceledTab?: boolean;
}

const BookingTable: React.FC<BookingTableProps> = ({ 
  bookings, 
  type, 
  onCancel, 
  showCanceledTab = false
}) => {
  const formatDate = (date: string) => {
    return format(parseISO(date), 'MMM dd, yyyy');
  };

  const getBookingTypeDetails = (booking: any) => {
    if (booking.type === 'doctor') {
      return {
        type: 'Doctor Appointment',
        name: booking.doctor_name_en || '',
        actual_price: booking.actual_price || "0.00",
        discounted_price: booking.discounted_price || "0.00",
        discount_amount: booking.actual_price && booking.discounted_price ? 
          (parseFloat(booking.actual_price) - parseFloat(booking.discounted_price)).toFixed(2) : "0.00"
      };
    } else {
      return {
        type: 'Service',
        name: booking.service_name_en || '',
        actual_price: booking.service_actual_price || "0.00",
        discounted_price: booking.service_discounted_price || "0.00",
        discount_amount: booking.service_actual_price && booking.service_discounted_price ? 
          (parseFloat(booking.service_actual_price) - parseFloat(booking.service_discounted_price)).toFixed(2) : "0.00"
      };
    }
  };

  const tableContainerStyle: React.CSSProperties = {
    overflow: 'visible',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    width: '100%',
    position: 'relative',
    maxWidth: '100%'
  };

  const tableWrapperStyle: React.CSSProperties = {
    width: '100%',
    overflowX: 'auto',
    position: 'relative'
  };

  const tableStyle: React.CSSProperties = {
    minWidth: '100%',
    width: '100%',
    tableLayout: 'auto',
    borderCollapse: 'collapse'
  };

  const stickyHeaderStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    backgroundColor: '#f8f9fa',
    zIndex: 1,
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    width: '100%',
    left: 0
  };

  const actionColumnStyle: React.CSSProperties = {
    whiteSpace: 'nowrap'
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-2 w-full">
        No {type} bookings found for the selected filter.
      </div>
    );
  }

  return (
    <div style={tableWrapperStyle}>
      <div style={tableContainerStyle}>
        <table style={tableStyle} className="table bordered-table sm-table mb-0">
          <thead>
            <tr style={stickyHeaderStyle}>
              <th scope="col">Order ID</th>
              <th scope="col">Customer Name</th>
              <th scope="col">Booking Type</th>
              <th scope="col">Date</th>
              <th scope="col">Branch Name</th>
              <th scope="col" className="text-right">Total Amount</th>
              <th scope="col" className="text-right">Discount Amount</th>
              <th scope="col" className="text-right">VAT (%) & Amount</th>
              <th scope="col" className="text-right">Final Total</th>
              {type === 'upcoming' && (
                <th scope="col" className="text-center" style={actionColumnStyle}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const details = getBookingTypeDetails(booking);
              return (
                <tr key={`${booking.type}-${booking.id}`}>
                  <td>{booking.id}</td>
                  <td>
                    <div>
                      <span>{booking.user_full_name}</span>
                      <div>
                        <span style={{ fontSize: '12px', color: '#666' }}>{booking.user_email}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: '#666' }}>{booking.user_phone_number}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span>{details.type}</span>
                      <div>
                        <span style={{ fontSize: '12px', color: '#666' }}>{details.name}</span>
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(booking.booking_date)}</td>
                  <td>{booking.branch_name_en}</td>
                  <td className="text-right">﷼{details.actual_price}</td>
                  <td className="text-right">﷼{details.discount_amount}</td>
                  <td className="text-right">
                    {booking.vat_percentage || 15}% (﷼{booking.vat_amount || "0.00"})
                  </td>
                  <td className="text-right font-medium">﷼{booking.final_total || "0.00"}</td>
                  {type === 'upcoming' && (
                    <td className="text-center" style={actionColumnStyle}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <button
                          disabled={showCanceledTab}
                          onClick={() => onCancel && onCancel(booking.id)}
                          style={{
                            border: 'none',
                            background: showCanceledTab ? '#808080' : '#007bff',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '3px',
                            cursor: showCanceledTab ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            marginRight: '4px'
                          }}>
                          Cancel/Refund
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

export default BookingTable;
