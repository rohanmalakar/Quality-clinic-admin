import React from 'react';
import { useSelector } from 'react-redux';


interface CancelModalProps {
  show: boolean;
  isCancelling: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelModal: React.FC<CancelModalProps> = ({
  show,
  isCancelling,
  error,
  onClose,
  onConfirm
}) => {
  if (!show) return null;

  const theme= useSelector((state: any) => state.user.theme);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      color: "black",
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        color: "black",
        backgroundColor: 'white',
        borderRadius: '4px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ margin: 0, color: "black", fontSize: '18px' }}>Cancel Booking</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            &times;
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ffdddd',
            color: '#f44336',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <p style={{ marginBottom: '24px' }}>
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              border: '1px solid #ccc',
              background: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            style={{
              border: 'none',
              background: isCancelling ? '#ccc' : '#f44336',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: isCancelling ? 'not-allowed' : 'pointer'
            }}
          >
            {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;
