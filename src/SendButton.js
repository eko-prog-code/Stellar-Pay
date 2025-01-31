import React, { useState } from 'react';

const SendXLMModal = ({ server, pair, refreshBalances, balance }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    memo: '',
    amount: '',
  });
  const [status, setStatus] = useState({
    loading: false,
    error: '',
    success: '',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setStatus({ loading: true, error: '', success: '' });
    
    try {
      // Create native XLM asset
      const asset = window.StellarSDK.Asset.native();
      
      // Load the sender's account
      const account = await server.loadAccount(pair.publicKey());
      
      // Build the transaction
      const transaction = new window.StellarSDK.TransactionBuilder(account)
        .addOperation(window.StellarSDK.Operation.payment({
          destination: formData.destination,
          asset: asset,
          amount: formData.amount.toString()
        }))
        .addMemo(window.StellarSDK.Memo.text(formData.memo || ''))
        .build();

      // Sign and submit the transaction
      transaction.sign(pair);
      await server.submitTransaction(transaction);

      setStatus({
        loading: false,
        error: '',
        success: 'Transaction completed successfully! ✨'
      });

      // Reset form and close modal after success
      setTimeout(() => {
        setFormData({ destination: '', memo: '', amount: '' });
        setStatus({ loading: false, error: '', success: '' });
        setIsOpen(false);
        refreshBalances();
      }, 2000);

    } catch (error) {
      setStatus({
        loading: false,
        error: error.message,
        success: ''
      });
    }
  };

  // Styles
  const styles = {
    container: {
      display: 'inline-block',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: isOpen ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease-in-out',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      animation: 'slideIn 0.3s ease-in-out',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    title: {
      margin: 0,
      fontSize: '1.5rem',
      color: '#333',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#666',
      transition: 'color 0.2s ease-in-out',
    },
    closeButtonHover: {
      color: '#333',
    },
    inputGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '500',
      color: '#555',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '1rem',
      transition: 'border-color 0.2s ease-in-out',
    },
    inputFocus: {
      borderColor: '#0096FF',
    },
    button: {
      backgroundColor: '#0096FF',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '1rem',
      width: '100%',
      transition: 'background-color 0.2s ease-in-out',
    },
    buttonHover: {
      backgroundColor: '#007acc',
    },
    error: {
      color: '#dc3545',
      marginBottom: '10px',
      fontSize: '0.875rem',
    },
    success: {
      color: '#28a745',
      marginBottom: '10px',
      fontSize: '0.875rem',
    },
    balanceInfo: {
      fontSize: '0.875rem',
      color: '#666',
      marginBottom: '10px',
    },
    input: {
      width: '100%',
      padding: '10px 12px', // Tambahkan padding-right di sini
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '1rem',
      transition: 'border-color 0.2s ease-in-out',
      boxSizing: 'border-box', // Pastikan padding tidak menambah lebar input
    },
  };

  return (
    <div style={styles.container}>
      <button 
        onClick={() => setIsOpen(true)}
        style={styles.button}
        onMouseEnter={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
        onMouseLeave={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
      >
        Send XLM 📤
      </button>

      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <div style={styles.header}>
            <h2 style={styles.title}>Send XLM</h2>
            <button 
              onClick={() => setIsOpen(false)}
              style={styles.closeButton}
              onMouseEnter={(e) => e.target.style.color = styles.closeButtonHover.color}
              onMouseLeave={(e) => e.target.style.color = styles.closeButton.color}
            >
              ×
            </button>
          </div>

          <div style={styles.inputGroup}>
            <p style={styles.balanceInfo}>Current Balance: {balance} XLM</p>
            <p style={styles.balanceInfo}>Transaction fee: 0.00001 XLM</p>
          </div>

          {status.error && (
            <div style={styles.error}>{status.error}</div>
          )}
          
          {status.success && (
            <div style={styles.success}>{status.success}</div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Destination Address</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="GXXXXX..."
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = styles.inputFocus.borderColor}
              onBlur={(e) => e.target.style.borderColor = styles.input.borderColor}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Amount (XLM)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.0"
              step="0.0000001"
              min="0"
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = styles.inputFocus.borderColor}
              onBlur={(e) => e.target.style.borderColor = styles.input.borderColor}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Memo (Optional)</label>
            <input
              type="text"
              name="memo"
              value={formData.memo}
              onChange={handleInputChange}
              placeholder="Add a message"
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = styles.inputFocus.borderColor}
              onBlur={(e) => e.target.style.borderColor = styles.input.borderColor}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={status.loading}
            style={styles.button}
            onMouseEnter={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
            onMouseLeave={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
          >
            {status.loading ? 'Processing...' : 'Send XLM'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendXLMModal;