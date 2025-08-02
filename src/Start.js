import React, { Component } from "react";
import GenerateWalletButton from "./GenerateWalletButton.js";
import "./Start.css";
import rocketImage from "./images/rocket.png";

class Start extends Component {
  constructor(props) {
    super(props);
    this.state = {
      privateKey: "",
      taglineIndex: 0,
      displayedTagline: "",
    };
    this.taglines = [
      "🚀 Bikin rekening dalam 1 detik \"Stellar Wallet\"",
      "🚀{user to blockchain to user} \"tanpa kendali institusi\" \"atau pemerintah\"",
      "🚀 Transaksi Global \"gunakan XLM Stellar\"",
      "🚀 Payment dan Aset Digital \"XLM Stellar\"",
      "🚀 Belajar menabung cerdas \"XLM Stellar\"",
    ];
  }

  componentDidMount() {
    this.startTypingEffect();
  }

  startTypingEffect = () => {
    let taglineIndex = 0;
    let charIndex = 0;
    
    const type = () => {
      if (charIndex < this.taglines[taglineIndex].length) {
        this.setState((prevState) => ({
          displayedTagline: prevState.displayedTagline + this.taglines[taglineIndex][charIndex],
        }));
        charIndex++;
        setTimeout(type, 100);
      } else {
        setTimeout(() => {
          this.setState({ displayedTagline: "" });
          taglineIndex = (taglineIndex + 1) % this.taglines.length;
          charIndex = 0;
          setTimeout(type, 500);
        }, 2000);
      }
    };
    type();
  };

  onSubmit(testnet) {
    this.props.initializeWallet(this.state.privateKey, testnet);
  }

  onChange(event) {
    this.setState({ privateKey: event.target.value });
  }

  handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      this.setState({ privateKey: text });
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      // Fallback for browsers that don't support clipboard API
      const dummy = document.createElement('input');
      document.body.appendChild(dummy);
      dummy.focus();
      document.execCommand('paste');
      this.setState({ privateKey: dummy.value });
      document.body.removeChild(dummy);
    }
  };

  render() {
    return (
      <div className="container min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">     
        <header className="w-full text-center py-6 border-b border-gray-700">
          <h1 className="text-4xl font-bold tracking-wide">🚀 Stellar Wallet</h1>
          <a className="text-blue-400 hover:text-blue-300 transition" href="https://innoview.vercel.app">
            by InnoView Indo Tech
          </a>
        </header>

        <div className="mt-8 flex items-center space-x-4">
          <img src={rocketImage} alt="Rocket" className="rocket" />
          <p className="text-xl font-semibold text-blue-400">{this.state.displayedTagline}</p>
        </div>

        <div className="mt-8 w-full max-w-md bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Private Key</label>
            <button 
              onClick={this.handlePaste}
              className="flex items-center text-sm text-white hover:text-blue-400 transition-colors"
            >
              <svg 
                className="w-4 h-4 mr-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                />
              </svg>
              Paste Private Key
            </button>
          </div>
          <input
            type="text"
            placeholder="Enter your private key..."
            value={this.state.privateKey}
            onChange={(e) => this.onChange(e)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="mt-6 flex flex-col space-y-5">
            <button className="w-full bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-md transition-colors" onClick={() => this.onSubmit(false)}>
              Open Wallet
            </button>
            <button className="w-full bg-green-500 hover:bg-green-400 px-4 py-2 rounded-md transition-colors" onClick={() => this.onSubmit(true)}>
              Open TestNet Wallet
            </button>
          </div>

          <div className="mt-6 text-center">
            <GenerateWalletButton initializeWallet={this.props.initializeWallet} />
          </div>
        </div>
      </div>
    );
  }
}

export default Start;
