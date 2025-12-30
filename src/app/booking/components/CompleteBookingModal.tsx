import React from 'react';

interface CompleteModalProps {
  show: boolean;
  isCompleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

const CompleteModal: React.FC<CompleteModalProps> = ({
  show,
  isCompleting,
  error,
  onClose,
  onConfirm
}) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
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
          <h3 style={{ margin: 0, fontSize: '18px' }}>Complete Booking</h3>
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
          Are you sure you want to Complete this booking? This action cannot be undone.
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
            Complete
          </button>
          <button
            onClick={onConfirm}
            disabled={isCompleting} 
            style={{
              border: 'none',
              background: isCompleting ? '#ccc' : '#f44336',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: isCompleting ? 'not-allowed' : 'pointer'
            }}
          >
            {isCompleting ? 'Completeling...' : 'Confirm Complete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteModal;
