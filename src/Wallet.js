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
    };
    this.scannerRef = React.createRef();
  }

  componentDidMount() {
    const styleSheet = document.createElement("style");
    document.head.appendChild(styleSheet);
    this.updateQrSize();
    window.addEventListener("resize", this.updateQrSize);
    this.checkCameraSupport();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateQrSize);
  }

  checkCameraSupport = async () => {
    try {
      // Check camera permission first
      await navigator.mediaDevices.getUserMedia({ video: true });
      this.setState({ cameraPermissionGranted: true });

      // Enumerate devices to check for back camera
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      const hasBackCamera = videoDevices.some((device) => {
        return (
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("rear")
        );
      });

      this.setState({
        hasBackCamera,
        facingMode: hasBackCamera ? { exact: "environment" } : "user",
      });
    } catch (error) {
      console.error("Camera check error:", error);
      this.setState({
        scanError: "Cannot access camera. Please ensure camera permission is granted.",
        cameraPermissionGranted: false,
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

    if (err.name === "OverconstrainedError" && err.constraint === "facingMode") {
      // If back camera not available, switch to front camera
      this.setState({
        facingMode: "user",
        hasBackCamera: false,
        scanError: "Back camera not available, switching to front camera",
      });
    } else {
      this.setState({
        scanError: "Failed to access camera. Please ensure camera permission is granted.",
      });
    }
  };

  toggleScanner = () => {
    if (!this.state.cameraPermissionGranted) {
      this.setState({
        scanError: "Camera permission required for QR code scanning",
      });
      return;
    }

    this.setState((prevState) => ({
      showScanner: !prevState.showScanner,
      scanError: null,
      scanResult: null,
      facingMode: this.state.hasBackCamera ? { exact: "environment" } : "user",
    }));
  };

  toggleCamera = () => {
    this.setState((prevState) => ({
      facingMode:
        prevState.facingMode.exact === "environment"
          ? "user"
          : { exact: "environment" },
    }));
  };

  render() {
    const mainBalance = this.props.balances.find(
      (b) => b.asset_type === "native"
    );
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
          >
            {showScanner ? "❌ Close Scanner" : "📷 Scan QR Code"}
          </button>
        </div>

        {showScanner && (
          <div className="qr-scanner-container">
            <QrScanner
              ref={this.scannerRef}
              delay={300}
              onError={this.handleError}
              onScan={this.handleScan}
              style={{ width: "100%" }}
              constraints={{
                video: {
                  facingMode: facingMode,
                  aspectRatio: 1,
                },
              }}
            />
            <div className="scanner-controls">
              {hasBackCamera && (
                <button
                  className="button button-camera"
                  onClick={this.toggleCamera}
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
            {scanError && <p className="scan-error">{scanError}</p>}
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
