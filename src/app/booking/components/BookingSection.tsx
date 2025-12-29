import React from 'react';
import BookingTable from './BookingTable';

interface BookingSectionProps {
  title: string;
  color: string;
  bookings: any[];
  activeTab: string;
  tabs: { value: string; label: string }[];
  type: 'upcoming' | 'completed';
  onTabChange: (tab: any) => void;
  onExport: () => void;
  onCancel?: (bookingId: string) => void;
}

const BookingSection: React.FC<BookingSectionProps> = ({
  title,
  color,
  bookings,
  activeTab,
  tabs,
  type,
  onTabChange,
  onExport,
  onCancel
}) => {
  const getHeadingContainerStyle = (): React.CSSProperties => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      return {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '1px solid #e2e8f0',
        width: '100%'
      };
    }
    return {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '1px solid #e2e8f0',
      width: '100%'
    };
  };

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: color,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  };

  const countBadgeStyle: React.CSSProperties = {
    backgroundColor: color,
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    padding: '2px 8px',
    borderRadius: '12px',
    marginLeft: '8px'
  };

  const csvButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: 'none',
    background: '#6b46c1',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };

  const getTabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    border: 'none',
    background: isActive ? '#007bff' : '#f0f0f0',
    color: isActive ? 'white' : 'black',
    padding: '6px 12px',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '13px',
    marginRight: '8px',
    marginBottom: '8px'
  });

  const icon = type === 'upcoming' ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  return (
    <div className="w-full">

      <div>
        <div className="mb-3 w-full" style={{ display: 'flex', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab.value}
              style={getTabButtonStyle(activeTab === tab.value)}
              onClick={() => onTabChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
         {/* <div style={getHeadingContainerStyle()}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            {bookings.length > 0 && (
              <button style={csvButtonStyle} onClick={onExport}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download CSV
              </button>
            )}
          </div>
        </div> */}
      </div>

      <BookingTable
        bookings={bookings}
        type={type}
        onCancel={onCancel}
        showCanceledTab={activeTab === 'canceled'}
      />
    </div>
  );
};

export default BookingSection;
