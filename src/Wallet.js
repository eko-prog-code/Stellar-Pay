import React, { Component } from "react";
import { QRCodeCanvas } from "qrcode.react";
import QrScanner from "react-qr-scanner";
import SendButton from "./SendButton";
import "./Wallet.css";

class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copySuccess: false,
      showScanner: false,
      scanResult: null,
      qrSize: 200,
      scanError: null,
      facingMode: { exact: "environment" }, // Default to back camera
      hasBackCamera: true,
      cameraPermissionGranted: false,
      addressCopied: false,
      retryCount: 0,
      maxRetries: 3,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      cameraReady: false
    };
    this.scannerRef = React.createRef();
  }

  componentDidMount() {
    this.updateQrSize();
    window.addEventListener("resize", this.updateQrSize);
    this.checkCameraSupport();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateQrSize);
    this.stopCameraStream();
  }

  stopCameraStream = () => {
    if (this.scannerRef.current && this.scannerRef.current.stream) {
      this.scannerRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  checkCameraSupport = async () => {
    try {
      // First try basic camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      this.stopCameraStream();
      
      this.setState({ cameraPermissionGranted: true });

      // Then specifically check for back camera
      try {
        const backStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        this.stopCameraStream();
        
        this.setState({ 
          hasBackCamera: true,
          facingMode: { exact: "environment" },
          cameraReady: true
        });
      } catch (backError) {
        console.log("Back camera not available, using front");
        this.setState({ 
          hasBackCamera: false,
          facingMode: "user",
          cameraReady: true
        });
      }

      // Additional check through device enumeration
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      
      const hasPhysicalBackCamera = videoDevices.some(device => {
        return (
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("rear")
        );
      });

      if (hasPhysicalBackCamera && !this.state.hasBackCamera) {
        this.setState({ hasBackCamera: true });
      }
    } catch (error) {
      console.error("Camera check error:", error);
      this.setState({
        scanError: "Cannot access camera. Please ensure camera permission is granted.",
        cameraPermissionGranted: false,
        hasBackCamera: false,
        facingMode: "user",
        cameraReady: true
      });
    }
  };

  updateQrSize = () => {
    const width = window.innerWidth;
    const size = Math.min(200, width * 0.6);
    this.setState({ qrSize: size });
  };

  copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      this.setState({ copySuccess: true, addressCopied: true });
      setTimeout(() => this.setState({ copySuccess: false, addressCopied: false }), 2000);
    });
  };

  handleScan = (data) => {
    if (data) {
      try {
        const scannedText = data.text.trim().toUpperCase();
        if (/^G[A-Z0-9]{55}$/.test(scannedText)) {
          this.setState({
            scanResult: scannedText,
            scanError: null,
            showScanner: false,
          });
          this.stopCameraStream();
        } else {
          throw new Error("Invalid Stellar address format");
        }
      } catch (error) {
        this.setState({
          scanError: "Invalid QR code. Please scan a Stellar address (starts with G, 56 characters)",
          scanResult: null,
        });
      }
    }
  };

  handleError = (err) => {
    console.error("Camera Error:", err);
    
    if (err.name === "OverconstrainedError") {
      if (this.state.retryCount < this.state.maxRetries) {
        this.setState(prevState => ({
          retryCount: prevState.retryCount + 1,
          scanError: `Adjusting camera (attempt ${prevState.retryCount + 1}/${this.state.maxRetries})`
        }));
        
        setTimeout(() => {
          this.setState({
            facingMode: this.state.hasBackCamera ? { exact: "environment" } : "user"
          });
        }, 500);
      } else {
        this.setState({
          facingMode: "user",
          hasBackCamera: false,
          scanError: "Using front camera",
          retryCount: 0
        });
      }
    } else if (err.name === "NotAllowedError") {
      this.setState({
        scanError: "Camera permission denied. Please enable camera access in settings.",
        cameraPermissionGranted: false
      });
    } else {
      this.setState({
        scanError: "Camera error. Please try again.",
      });
    }
  };

  toggleScanner = () => {
    if (!this.state.cameraPermissionGranted) {
      this.setState({
        scanError: "Camera permission required for QR scanning",
      });
      return;
    }

    this.setState(prevState => {
      if (prevState.showScanner) {
        this.stopCameraStream();
        return {
          showScanner: false,
          scanError: null,
          scanResult: null,
          retryCount: 0
        };
      } else {
        return {
          showScanner: true,
          scanError: null,
          scanResult: null,
          facingMode: this.state.hasBackCamera ? { exact: "environment" } : "user",
          retryCount: 0
        };
      }
    });
  };

  toggleCamera = () => {
    this.setState(prevState => {
      const newFacingMode = 
        prevState.facingMode.exact === "environment" 
          ? "user" 
          : { exact: "environment" };
      
      return {
        facingMode: newFacingMode,
        retryCount: 0,
        scanError: null
      };
    });
  };

  getCameraConstraints = () => {
    if (this.state.isIOS) {
      return {
        video: {
          facingMode: this.state.facingMode,
          width: { ideal: 800 },
          height: { ideal: 600 }
        }
      };
    }
    
    return {
      video: {
        facingMode: this.state.facingMode,
        aspectRatio: 1,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
  };

  render() {
    const mainBalance = this.props.balances.find(b => b.asset_type === "native");
    const xlmBalance = mainBalance ? mainBalance.balance : "0";
    const stellarchainBaseUrl = `https://stellarchain.io/accounts/${this.props.publicKey}`;
    const {
      scanResult,
      showScanner,
      qrSize,
      scanError,
      facingMode,
      hasBackCamera,
      addressCopied,
      retryCount,
      maxRetries,
      cameraReady
    } = this.state;

    return (
      <div className="wallet-container">
        <header className="wallet-header">
          <h3 className="wallet-title">🚀 InnoView Indo Tech</h3>
          <p className="company-name">Stellar Wallet</p>
        </header>

        <div className="qr-code-section">
          <div className="qr-code-container">
            <QRCodeCanvas
              value={this.props.publicKey}
              size={qrSize}
              level="H"
              includeMargin={true}
            />
            <p className="qr-code-label">Scan to receive Stellar address</p>
          </div>
        </div>

        <div className="public-key-section">
          <strong className="public-key">Public Key:</strong>
          <span className="public-key">{this.props.publicKey}</span>
          <button
            className="copy-button"
            onClick={() => this.copyToClipboard(this.props.publicKey)}
          >
            {this.state.copySuccess ? "✅" : "📋"}
          </button>
          <a
            href={stellarchainBaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="stellarchain-link"
            title="View on Stellarchain"
          >
            🔗
          </a>
        </div>

        <div className="action-buttons">
          <button
            className="button button-primary"
            onClick={this.props.refreshBalances}
          >
            🔄 Refresh
          </button>
          <button
            className="button button-secondary"
            onClick={this.toggleScanner}
            disabled={!cameraReady}
          >
            {showScanner ? "❌ Close Scanner" : "📷 Scan QR Code"}
          </button>
        </div>

        {showScanner && (
          <div className="qr-scanner-container">
            {cameraReady && (
              <QrScanner
                ref={this.scannerRef}
                delay={300}
                onError={this.handleError}
                onScan={this.handleScan}
                style={{ width: "100%" }}
                constraints={this.getCameraConstraints()}
              />
            )}
            
            <div className="scanner-controls">
              {hasBackCamera && (
                <button
                  className="button button-camera"
                  onClick={this.toggleCamera}
                  disabled={retryCount > 0}
                >
                  {facingMode.exact === "environment"
                    ? "📱 Front Camera"
                    : "📷 Back Camera"}
                </button>
              )}
            </div>
            
            <p className="scanner-instruction">
              Point camera at Stellar QR Code
            </p>
            
            {scanError && (
              <p className="scan-error">
                {scanError}
                {retryCount > 0 && (
                  <span> (Retrying {retryCount}/{maxRetries})</span>
                )}
              </p>
            )}
          </div>
        )}

        {scanResult && (
          <div className="scan-result-section">
            <h4>Scanned Stellar Address:</h4>
            <div className="scan-result-text">{scanResult}</div>
            {addressCopied && (
              <div className="copy-success-message">
                Address copied successfully!
              </div>
            )}
            <div className="scan-result-actions">
              <button
                className="button button-primary"
                onClick={() => this.copyToClipboard(scanResult)}
              >
                Copy Address
              </button>
              <button
                className="button button-secondary"
                onClick={() => this.setState({ scanResult: null })}
              >
                Close
              </button>
            </div>
            <p className="scan-hint">
              Address has been normalized to standard Stellar format
            </p>
          </div>
        )}

        <div className="balance-card">
          <div className="balance-header">
            <span className="asset-code">XLM</span>
          </div>
          <div className="balance-amount">{xlmBalance}</div>
          <SendButton
            native={true}
            assetCode="XLM"
            server={this.props.server}
            pair={this.props.pair}
            amount={xlmBalance}
            refreshBalances={this.props.refreshBalances}
          />
        </div>

        {this.props.balances
          .filter((b) => b.asset_type !== "native")
          .map((balance, index) => (
            <div className="balance-card" key={index}>
              <div className="balance-header">
                <span className="asset-code">{balance.asset_code}</span>
              </div>
              <div className="balance-amount">{balance.balance}</div>
              <SendButton
                native={false}
                assetCode={balance.asset_code}
                issuer={balance.asset_issuer}
                server={this.props.server}
                pair={this.props.pair}
                amount={balance.balance}
                refreshBalances={this.props.refreshBalances}
              />
            </div>
          ))}

        <div className="wallet-footer">
          <div className="wallet-icon">💰</div>
          <div className="balance-icon">💼</div>
        </div>
      </div>
    );
  }
}

export default Wallet;
