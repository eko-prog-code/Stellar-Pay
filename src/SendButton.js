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
  const [isClosing, setIsClosing] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setFormData({
        ...formData,
        destination: text,
      });
      
      // Animasi paste berhasil
      const pasteBtn = document.querySelector('.paste-button');
      pasteBtn.innerHTML = '✓';
      setTimeout(() => {
        pasteBtn.innerHTML = '📋';
      }, 1000);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      const text = window.prompt('Paste the destination address:');
      if (text) {
        setFormData({
          ...formData,
          destination: text,
        });
      }
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const handleSubmit = async () => {
    setStatus({ loading: true, error: '', success: '' });
    
    try {
      const asset = window.StellarSDK.Asset.native();
      const account = await server.loadAccount(pair.publicKey());
      
      const transaction = new window.StellarSDK.TransactionBuilder(account)
        .addOperation(window.StellarSDK.Operation.payment({
          destination: formData.destination,
          asset: asset,
          amount: formData.amount.toString()
        }))
        .addMemo(window.StellarSDK.Memo.text(formData.memo || ''))
        .build();

      transaction.sign(pair);
      await server.submitTransaction(transaction);

      setStatus({
        loading: false,
        error: '',
        success: 'Transaction completed successfully! ✨'
      });

      setTimeout(() => {
        setFormData({ destination: '', memo: '', amount: '' });
        setStatus({ loading: false, error: '', success: '' });
        handleClose();
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

  // Styles with modern teen-friendly design
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
      animation: isClosing ? 'fadeOut 0.3s ease-in-out' : 'fadeIn 0.3s ease-in-out',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '25px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      animation: isClosing ? 'slideOut 0.3s ease-in-out' : 'slideIn 0.3s ease-in-out',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    title: {
      margin: 0,
      fontSize: '1.8rem',
      color: '#333',
      fontWeight: '700',
      background: 'linear-gradient(90deg, #0096FF, #00D4FF)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.8rem',
      cursor: 'pointer',
      color: '#ff4757',
      transition: 'all 0.3s ease',
      transform: 'scale(1)',
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
    },
    closeButtonHover: {
      transform: 'scale(1.1) rotate(90deg)',
      color: '#ff6b81',
    },
    inputGroup: {
      marginBottom: '20px',
      position: 'relative',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#555',
      fontSize: '0.95rem',
    },
    input: {
      width: '100%',
      padding: '12px 50px 12px 15px',
      borderRadius: '10px',
      border: '2px solid #e0e0e0',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      backgroundColor: '#f8f9fa',
    },
    inputFocus: {
      borderColor: '#0096FF',
      boxShadow: '0 0 0 3px rgba(0, 150, 255, 0.2)',
      backgroundColor: '#fff',
    },
    button: {
      backgroundColor: '#0096FF',
      color: 'white',
      border: 'none',
      padding: '14px 20px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '1rem',
      width: '100%',
      transition: 'all 0.3s ease',
      fontWeight: '600',
      letterSpacing: '0.5px',
      boxShadow: '0 4px 6px rgba(0, 150, 255, 0.2)',
    },
    buttonHover: {
      backgroundColor: '#007acc',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 8px rgba(0, 150, 255, 0.3)',
    },
    error: {
      color: '#ff4757',
      marginBottom: '10px',
      fontSize: '0.875rem',
      fontWeight: '500',
      padding: '10px',
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 71, 87, 0.1)',
    },
    success: {
      color: '#2ed573',
      marginBottom: '10px',
      fontSize: '0.875rem',
      fontWeight: '500',
      padding: '10px',
      borderRadius: '8px',
      backgroundColor: 'rgba(46, 213, 115, 0.1)',
    },
    balanceInfo: {
      fontSize: '0.9rem',
      color: '#666',
      marginBottom: '8px',
      fontWeight: '500',
    },
    pasteButton: {
      position: 'absolute',
      right: '12px',
      top: '38px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#666',
      fontSize: '1.5rem',
      transition: 'all 0.3s ease',
      transform: 'scale(1)',
      padding: '5px',
      borderRadius: '50%',
    },
    pasteButtonHover: {
      color: '#0096FF',
      transform: 'scale(1.1)',
      backgroundColor: 'rgba(0, 150, 255, 0.1)',
    },
  };

  // CSS animations
  const animations = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(20px); opacity: 0; }
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{animations}</style>
      
      <button 
        onClick={() => setIsOpen(true)}
        style={styles.button}
        onMouseEnter={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
        onMouseLeave={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
      >
        Send XLM 🚀
      </button>

      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <div style={styles.header}>
            <h2 style={styles.title}>Send XLM 💫</h2>
            <button 
              onClick={handleClose}
              style={styles.closeButton}
              onMouseEnter={(e) => {
                e.target.style.transform = styles.closeButtonHover.transform;
                e.target.style.color = styles.closeButtonHover.color;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = styles.closeButton.transform;
                e.target.style.color = styles.closeButton.color;
              }}
              aria-label="Close"
            >
              ❌
            </button>
          </div>

          <div style={styles.inputGroup}>
            <p style={styles.balanceInfo}>💰 Current Balance: {balance} XLM</p>
            <p style={styles.balanceInfo}>⏳ Transaction fee: 0.00001 XLM</p>
          </div>

          {status.error && (
            <div style={styles.error}>❌ {status.error}</div>
          )}
          
          {status.success && (
            <div style={styles.success}>✅ {status.success}</div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>📍 Destination Address</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="GXXXXX..."
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = styles.inputFocus.borderColor;
                e.target.style.boxShadow = styles.inputFocus.boxShadow;
                e.target.style.backgroundColor = styles.inputFocus.backgroundColor;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = styles.input.borderColor;
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = styles.input.backgroundColor;
              }}
            />
            <button
              onClick={handlePaste}
              className="paste-button"
              style={styles.pasteButton}
              onMouseEnter={(e) => {
                e.target.style.color = styles.pasteButtonHover.color;
                e.target.style.transform = styles.pasteButtonHover.transform;
                e.target.style.backgroundColor = styles.pasteButtonHover.backgroundColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = styles.pasteButton.color;
                e.target.style.transform = styles.pasteButton.transform;
                e.target.style.backgroundColor = 'transparent';
              }}
              title="Paste from clipboard"
              aria-label="Paste"
            >
              📋
            </button>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>💵 Amount (XLM)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.0"
              step="0.0000001"
              min="0"
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = styles.inputFocus.borderColor;
                e.target.style.boxShadow = styles.inputFocus.boxShadow;
                e.target.style.backgroundColor = styles.inputFocus.backgroundColor;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = styles.input.borderColor;
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = styles.input.backgroundColor;
              }}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>📝 Memo (Optional)</label>
            <input
              type="text"
              name="memo"
              value={formData.memo}
              onChange={handleInputChange}
              placeholder="Add a message..."
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = styles.inputFocus.borderColor;
                e.target.style.boxShadow = styles.inputFocus.boxShadow;
                e.target.style.backgroundColor = styles.inputFocus.backgroundColor;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = styles.input.borderColor;
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = styles.input.backgroundColor;
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={status.loading}
            style={{
              ...styles.button,
              animation: status.loading ? 'pulse 1.5s infinite' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!status.loading) {
                e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
                e.target.style.transform = styles.buttonHover.transform;
                e.target.style.boxShadow = styles.buttonHover.boxShadow;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = styles.button.backgroundColor;
              e.target.style.transform = 'none';
              e.target.style.boxShadow = styles.button.boxShadow;
            }}
          >
            {status.loading ? (
              <>⏳ Processing...</>
            ) : (
              <>🚀 Send XLM</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendXLMModal;
