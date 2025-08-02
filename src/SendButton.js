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
      position: 'relative',
    },
    title: {
      margin: 0,
      fontSize: '1.8rem',
      color: '#333',
      fontWeight: '700',
      background: 'linear-gradient(90deg, #0096FF, #00D4FF)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textAlign: 'center',
      flex: 1,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.8rem',
      cursor: 'pointer',
      color: '#ff4757',
      transition: 'all 0.3s ease',
      position: 'absolute',
      right: 0,
      top: 0,
      padding: '5px',
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
      padding: '12px 45px 12px 15px',
      borderRadius: '10px',
      border: '2px solid #e0e0e0',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      backgroundColor: '#f8f9fa',
      color: '#333',
    },
    inputFocus: {
      borderColor: '#0096FF',
      boxShadow: '0 0 0 3px rgba(0, 150, 255, 0.2)',
      backgroundColor: '#fff',
      color: '#000',
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
      marginTop: '30px',
    },
    pasteButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: translateY(calc(-50% - 12px)); /* Naik 12px dari tengah */,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#666',
      fontSize: '1.5rem', // Diperbesar dari 1.2rem
      width: '32px', // Lebar tetap
      height: '32px', // Tinggi tetap
      transition: 'all 0.3s ease',
      padding: '5px',
      borderRadius: '50%',
      zIndex: 1,
    },
    pasteButtonHover: {
      color: '#0096FF',
      transform: 'translateY(-50%) scale(1.1)',
      backgroundColor: 'rgba(0, 150, 255, 0.1)',
    },
    mobileStyles: {
      modalContent: {
        padding: '20px',
        borderRadius: '12px',
      },
      title: {
        fontSize: '1.5rem',
        paddingRight: '30px',
      },
      closeButton: {
        fontSize: '1.5rem',
      },
      input: {
        padding: '10px 40px 10px 12px',
      },
      pasteButton: {
        right: '10px',
        fontSize: '1rem',
      }
    }
  };

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
    
    @media (max-width: 600px) {
      .modal-content {
        padding: 20px;
        border-radius: 12px;
      }
      .modal-title {
        font-size: 1.5rem;
        padding-right: 30px;
      }
      .close-button {
        font-size: 1.5rem;
      }
      .input-field {
        padding: 10px 40px 10px 12px;
      }
      .paste-button {
        right: 10px;
        font-size: 1rem;
      }
    }
  `;

  const isMobile = window.innerWidth <= 600;
  const currentStyles = isMobile ? {
    ...styles,
    modalContent: { ...styles.modalContent, ...styles.mobileStyles.modalContent },
    title: { ...styles.title, ...styles.mobileStyles.title },
    closeButton: { ...styles.closeButton, ...styles.mobileStyles.closeButton },
    input: { ...styles.input, ...styles.mobileStyles.input },
    pasteButton: { ...styles.pasteButton, ...styles.mobileStyles.pasteButton }
  } : styles;

  return (
    <div style={currentStyles.container}>
      <style>{animations}</style>
      
      <button 
        onClick={() => setIsOpen(true)}
        style={currentStyles.button}
        onMouseEnter={(e) => e.target.style.backgroundColor = currentStyles.buttonHover.backgroundColor}
        onMouseLeave={(e) => e.target.style.backgroundColor = currentStyles.button.backgroundColor}
      >
        Send XLM 🚀
      </button>

      <div style={currentStyles.modalOverlay}>
        <div style={currentStyles.modalContent}>
          <div style={currentStyles.header}>
            <h2 style={currentStyles.title}>Send XLM 💫</h2>
            <button 
              onClick={handleClose}
              style={currentStyles.closeButton}
              onMouseEnter={(e) => {
                e.target.style.transform = currentStyles.closeButtonHover.transform;
                e.target.style.color = currentStyles.closeButtonHover.color;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'none';
                e.target.style.color = currentStyles.closeButton.color;
              }}
              aria-label="Close"
            >
              ❌
            </button>
          </div>

          <div style={currentStyles.inputGroup}>
            <p style={currentStyles.balanceInfo}>💰 Current Balance: {balance} XLM</p>
            <p style={currentStyles.balanceInfo}>⏳ Transaction fee: 0.00001 XLM</p>
          </div>

          {status.error && (
            <div style={currentStyles.error}>❌ {status.error}</div>
          )}
          
          {status.success && (
            <div style={currentStyles.success}>✅ {status.success}</div>
          )}

          <div style={currentStyles.inputGroup}>
            <label style={currentStyles.label}>📍 Destination Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="GXXXXX..."
                style={currentStyles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = currentStyles.inputFocus.borderColor;
                  e.target.style.boxShadow = currentStyles.inputFocus.boxShadow;
                  e.target.style.backgroundColor = currentStyles.inputFocus.backgroundColor;
                  e.target.style.color = currentStyles.inputFocus.color;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = currentStyles.input.borderColor;
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = currentStyles.input.backgroundColor;
                  e.target.style.color = currentStyles.input.color;
                }}
              />
              <button
                onClick={handlePaste}
                className="paste-button"
                style={currentStyles.pasteButton}
                onMouseEnter={(e) => {
                  e.target.style.color = currentStyles.pasteButtonHover.color;
                  e.target.style.transform = currentStyles.pasteButtonHover.transform;
                  e.target.style.backgroundColor = currentStyles.pasteButtonHover.backgroundColor;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = currentStyles.pasteButton.color;
                  e.target.style.transform = 'translateY(-50%)';
                  e.target.style.backgroundColor = 'transparent';
                }}
                title="Paste from clipboard"
                aria-label="Paste"
              >
                📋
              </button>
            </div>
          </div>

          <div style={currentStyles.inputGroup}>
            <label style={currentStyles.label}>💵 Amount (XLM)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.0"
              step="0.0000001"
              min="0"
              style={currentStyles.input}
              onFocus={(e) => {
                e.target.style.borderColor = currentStyles.inputFocus.borderColor;
                e.target.style.boxShadow = currentStyles.inputFocus.boxShadow;
                e.target.style.backgroundColor = currentStyles.inputFocus.backgroundColor;
                e.target.style.color = currentStyles.inputFocus.color;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = currentStyles.input.borderColor;
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = currentStyles.input.backgroundColor;
                e.target.style.color = currentStyles.input.color;
              }}
            />
          </div>

          <div style={currentStyles.inputGroup}>
            <label style={currentStyles.label}>📝 Memo (Optional)</label>
            <input
              type="text"
              name="memo"
              value={formData.memo}
              onChange={handleInputChange}
              placeholder="Add a message..."
              style={currentStyles.input}
              onFocus={(e) => {
                e.target.style.borderColor = currentStyles.inputFocus.borderColor;
                e.target.style.boxShadow = currentStyles.inputFocus.boxShadow;
                e.target.style.backgroundColor = currentStyles.inputFocus.backgroundColor;
                e.target.style.color = currentStyles.inputFocus.color;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = currentStyles.input.borderColor;
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = currentStyles.input.backgroundColor;
                e.target.style.color = currentStyles.input.color;
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={status.loading}
            style={{
              ...currentStyles.button,
              animation: status.loading ? 'pulse 1.5s infinite' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!status.loading) {
                e.target.style.backgroundColor = currentStyles.buttonHover.backgroundColor;
                e.target.style.transform = currentStyles.buttonHover.transform;
                e.target.style.boxShadow = currentStyles.buttonHover.boxShadow;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = currentStyles.button.backgroundColor;
              e.target.style.transform = 'none';
              e.target.style.boxShadow = currentStyles.button.boxShadow;
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
