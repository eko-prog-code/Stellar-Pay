import React, { Component } from 'react';

// Styles untuk layout dan tampilan
const styles = `
.wallet-button {
  background-color: #00bfff; /* Light Blue */
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 30px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.wallet-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  padding: 20px;
}

.modal-overlay.open {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  position: relative;
  transform: translateY(20px) scale(0.95);
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.modal-overlay.open .modal-content {
  transform: translateY(0) scale(1);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  transform: none;
}

.close-button .close-icon {
  width: 24px;
  height: 24px;
  color: #ff0000; /* Red color for the X */
}

.close-button .pulse-dot {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  background-color: #ff0000; /* Red dot */
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-body {
  padding: 20px;
}

.key-section {
  margin-bottom: 20px;
  position: relative;
}

.key-label {
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.key-value {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  word-break: break-all;
  font-family: monospace;
  font-size: 0.9rem;
  border: 1px solid #eee;
}

.key-value.private-key, .key-value.public-key {
  background-color: #e9ecef;
}

.key-value.private-key {
  color: #003366; /* Dark blue for private key */
}

.key-value.public-key {
  color: #003366; /* Dark blue for public key */
}

.copy-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 18px;
}

.modal-footer {
  padding: 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  border-radius: 0 0 12px 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Common button style */
.action-button {
  background-color: #00bfff; /* Default color (light blue) */
  color: white;
  padding: 12px 24px;  /* Same padding for all buttons */
  border: none;
  border-radius: 8px;  /* Rounded corners for consistency */
  font-weight: 600;  /* Consistent font weight */
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 5px;  /* Optional: margin to space out buttons */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Button-specific colors */
.button-primary {
  background-color: #007bff;  /* Blue for MainNet */
}

.button-primary:hover {
  background-color: #0056b3;  /* Darker blue on hover */
}

.button-success {
  background-color: #28a745;  /* Green for TestNet */
}

.button-success:hover {
  background-color: #218838;  /* Darker green on hover */
}

.button-secondary {
  background-color: #e9ecef;  /* Light gray for Close */
  color: #333;
}

.button-secondary:hover {
  background-color: #dde2e6;  /* Slightly darker gray on hover */
}


@media (max-width: 576px) {
  .modal-header {
    padding-right: 30px;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .action-button {
    width: 100%;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}
`;

class GenerateWalletButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      pair: null,
      isClosing: false
    };
  }

  componentDidMount() {
    // Inject styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    this.setState({
      pair: window.StellarSDK.Keypair.random()
    });
  }

  addFunds() {
    fetch('https://horizon-testnet.stellar.org/friendbot?addr=' + this.state.pair.publicKey())
      .then((error, response, body) => {
        if (error || response.statusCode !== 200) {
          console.log("friendbot failed :(");
          console.log(error.message);
        } else {
          console.log("add test funds success!");
        }
      })
  }

  handleClose = () => {
    this.setState({ isClosing: true });
    setTimeout(() => {
      this.setState({ open: false, isClosing: false });
    }, 300);
  }

  copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  }

  render() {
    return (
      <div>
        <button 
          className="wallet-button"
          onClick={() => this.setState({ open: true })}
        >
          Generate Wallet
        </button>

        <div className={`modal-overlay ${this.state.open ? 'open' : ''}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Generate Wallet</h2>
              <button className="close-button" onClick={this.handleClose}>
                <div className="pulse-dot"></div>
              </button>
            </div>

            <div className="modal-body">
              <div className="key-section">
                <label className="key-label">Secret Key (SAVE THIS!):</label>
                <div className="key-value private-key">
                  {this.state.pair ? this.state.pair.secret() : "Loading..."}
                  <span 
                    className="copy-button"
                    onClick={() => this.copyToClipboard(this.state.pair ? this.state.pair.secret() : '')}
                  >
                    📋
                  </span>
                </div>
              </div>

              <div className="key-section">
                <label className="key-label">Public Key:</label>
                <div className="key-value public-key">
                  {this.state.pair ? this.state.pair.publicKey() : "Loading..."}
                  <span 
                    className="copy-button"
                    onClick={() => this.copyToClipboard(this.state.pair ? this.state.pair.publicKey() : '')}
                  >
                    📋
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="action-button button-primary"
                onClick={() => {
                  this.addFunds();
                  this.props.initializeWallet(this.state.pair.secret(), true);
                }}
              >
                Go (TestNet)
              </button>
              <button
                className="action-button button-success"
                onClick={() => this.props.initializeWallet(this.state.pair.secret(), false)}
              >
                Go (MainNet)
              </button>
              <button
                className="action-button button-secondary"
                onClick={this.handleClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default GenerateWalletButton;
