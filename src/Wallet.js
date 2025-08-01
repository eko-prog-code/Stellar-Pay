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
      xlmPriceUSD: 0,
      usdToIdr: 0,
      showInIDR: false,
      scanResult: null,
      showScanner: false,
      qrSize: 200,
      scanError: null,
      facingMode: "environment", // Default to back camera
    };
    this.scannerRef = React.createRef();
  }

  componentDidMount() {
    const styleSheet = document.createElement("style");
    document.head.appendChild(styleSheet);
    this.fetchXLMPrice();
    this.fetchCurrencyRates();
    this.updateQrSize();
    window.addEventListener("resize", this.updateQrSize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateQrSize);
  }

  updateQrSize = () => {
    const width = window.innerWidth;
    const size = Math.min(200, width * 0.6);
    this.setState({ qrSize: size });
  };

  fetchXLMPrice = async () => {
    try {
      const response = await fetch("https://api.coincap.io/v2/assets/stellar");
      const data = await response.json();
      this.setState({ xlmPriceUSD: parseFloat(data.data.priceUsd) });
    } catch (error) {
      console.error("Error fetching XLM price:", error);
    }
  };

  fetchCurrencyRates = async () => {
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await response.json();
      this.setState({ usdToIdr: data.rates.IDR });
    } catch (error) {
      console.error("Error fetching currency rates:", error);
    }
  };

  copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      this.setState({ copySuccess: true });
      setTimeout(() => this.setState({ copySuccess: false }), 2000);
    });
  };

  toggleCurrency = () => {
    this.setState((prevState) => ({ showInIDR: !prevState.showInIDR }));
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
          throw new Error("Invalid Stellar public key format");
        }
      } catch (error) {
        this.setState({
          scanError:
            "Invalid QR code. Please scan a valid Stellar address (starts with G, 56 characters)",
          scanResult: null,
        });
      }
    }
  };

  handleError = (err) => {
    console.error(err);
    this.setState({
      scanError:
        "Failed to scan QR code. Please ensure camera access is granted.",
    });
  };

  toggleScanner = () => {
    this.setState((prevState) => ({
      showScanner: !prevState.showScanner,
      scanError: null,
      scanResult: null,
      facingMode: "environment", // Always default to back camera when opening
    }));
  };

  toggleCamera = () => {
    this.setState((prevState) => ({
      facingMode: prevState.facingMode === "user" ? "environment" : "user",
    }));
  };

  render() {
    const mainBalance = this.props.balances.find(
      (b) => b.asset_type === "native"
    );
    const xlmBalance = mainBalance ? mainBalance.balance : "0";
    const stellarchainBaseUrl = `https://stellarchain.io/accounts/${this.props.publicKey}`;
    const {
      xlmPriceUSD,
      usdToIdr,
      showInIDR,
      scanResult,
      showScanner,
      qrSize,
      scanError,
      facingMode,
    } = this.state;

    const balanceInUSD = xlmBalance * xlmPriceUSD;
    const balanceInIDR = balanceInUSD * usdToIdr;

    const displayedBalance = showInIDR
      ? balanceInIDR.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        })
      : `$${balanceInUSD.toFixed(2)}`;

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
              facingMode={facingMode}
              constraints={{
                facingMode: facingMode,
                aspectRatio: 1, // Helps with square QR code scanning
              }}
            />
            <div className="scanner-controls">
              <button
                className="button button-camera"
                onClick={this.toggleCamera}
              >
                {facingMode === "environment"
                  ? "📱 Front Camera"
                  : "📷 Back Camera"}
              </button>
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
                Clear
              </button>
            </div>
            <p className="scan-hint">
              Address has been normalized to standard Stellar format
            </p>
          </div>
        )}

        {/* Rest of your wallet components */}
        <div className="balance-card">
          <div className="balance-header">
            <span className="asset-code">XLM</span>
            <button
              className="currency-toggle-button"
              onClick={this.toggleCurrency}
            >
              {showInIDR ? "Switch to USD" : "Switch to IDR"}
            </button>
          </div>
          <div className="balance-amount">{xlmBalance}</div>
          <div className="converted-balance">{displayedBalance}</div>
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
