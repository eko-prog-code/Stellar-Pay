import React, { Component } from 'react';
import SendButton from './SendButton';
import "./Wallet.css"

class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copySuccess: false,
      xlmPriceUSD: 0,
      usdToIdr: 0,
      showInIDR: false
    };
  }

  componentDidMount() {
    const styleSheet = document.createElement("style");
    document.head.appendChild(styleSheet);
    this.fetchXLMPrice();
    this.fetchCurrencyRates();
  }

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

  render() {
    const mainBalance = this.props.balances.find(b => b.asset_type === 'native');
    const xlmBalance = mainBalance ? mainBalance.balance : '0';
    const stellarchainBaseUrl = `https://stellarchain.io/accounts/${this.props.publicKey}`;
    const { xlmPriceUSD, usdToIdr, showInIDR } = this.state;

    const balanceInUSD = xlmBalance * xlmPriceUSD;
    const balanceInIDR = balanceInUSD * usdToIdr;

    const displayedBalance = showInIDR ? balanceInIDR.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : `$${balanceInUSD.toFixed(2)}`;

    return (
      <div className="wallet-container">
        <header className="wallet-header">
          <h3 className="wallet-title">🚀 InnoView Indo Tech</h3>
          <p className="company-name">Stellar Wallet</p>
        </header>

        <div className="public-key-section">
          <strong className='public-key'>Public Key:</strong> <span className="public-key">{this.props.publicKey}</span>
          <button 
            className="copy-button" 
            onClick={() => this.copyToClipboard(this.props.publicKey)}
          >
            {this.state.copySuccess ? '✅' : '📋'}
          </button>
          <a 
            href={stellarchainBaseUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="stellarchain-link"
            title="Lihat di Stellarchain"
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
        </div>

        <div className="balance-card">
          <div className="balance-header">
            <span className="asset-code">XLM</span>
            <button 
              className="currency-toggle-button"
              onClick={this.toggleCurrency}
            >
              {showInIDR ? 'Switch to USD' : 'Switch to IDR'}
            </button>
          </div>
          <div className="balance-amount">{xlmBalance}</div>
          <div className="converted-balance">
            {displayedBalance}
          </div>
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
          .filter(b => b.asset_type !== 'native')
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
          ))
        }

        <div className="wallet-footer">
          <div className="wallet-icon">💰</div>
          <div className="balance-icon">💼</div>
        </div>
      </div>
    );
  }
}

export default Wallet;