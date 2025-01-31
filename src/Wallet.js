import React, { Component } from 'react';
import SendButton from './SendButton';

const styles = `
.wallet-container {
  padding: 16px;
  max-width: 100%;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #121212;
  color: #fff;
}

.wallet-header {
  text-align: center;
  padding: 20px 0;
  margin-bottom: 24px;
}

.wallet-title {
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
}

.company-name {
  color: #ff4500;
  margin: 5px 0;
  font-size: 18px;
}

.public-key-section {
  background: #333;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  position: relative;
  word-break: break-all;
}

.public-key {
  color: #1e90ff;
  font-weight: bold;
}

.copy-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 22px;
  color: #fff;
  cursor: pointer;
}

.copy-button:hover {
  opacity: 0.8;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.button {
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button-primary {
  background-color: #007bff; /* Solid blue for refresh button */
  color: white;
}

.button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.balance-card {
  background: #222;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.asset-code {
  font-weight: bold;
  font-size: 20px;
  color: #ff4500;
}

.balance-amount {
  font-size: 26px;
  color: #28a745;
  margin: 10px 0;
}

@media (min-width: 768px) {
  .wallet-container {
    max-width: 768px;
  }

  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Hide wallet emoji on PC */
  .wallet-footer .wallet-icon {
    display: none;
  }
}

.wallet-footer {
  display: flex;
  justify-content: space-between;
  position: fixed;
  bottom: 20px;
  right: 20px;
}

.wallet-footer .wallet-icon {
  font-size: 40px;
  color: #ff4500;
}

.wallet-footer .balance-icon {
  font-size: 40px;
  color: #ff6347;
}

/* Mobile Specific */
@media (max-width: 767px) {
  /* Move the copy button to the right bottom on mobile */
  .copy-button {
    right: 10px;
    bottom: 10px;
    transform: translateY(0);
  }

  /* Show wallet emoji only on mobile */
  .wallet-footer .wallet-icon {
    display: block;
  }

  /* Hide balance emoji on mobile */
  .wallet-footer .balance-icon {
    display: none;
  }
}
`;

class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copySuccess: false
    };
  }

  componentDidMount() {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      this.setState({ copySuccess: true });
      setTimeout(() => this.setState({ copySuccess: false }), 2000);
    });
  }

  render() {
    const mainBalance = this.props.balances.find(b => b.asset_type === 'native');
    const xlmBalance = mainBalance ? mainBalance.balance : '0';

    return (
      <div className="wallet-container">
        <header className="wallet-header">
          <h1 className="wallet-title">🚀 InnoView Indo Tech</h1>
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
