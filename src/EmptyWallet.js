import React, { useState } from "react";
import "./EmptyWallet.css";

const Start = ({ initializeWallet, privateKey, testnet, publicKey }) => {
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const onSubmit = () => {
    setLoading(true);
    initializeWallet(privateKey, testnet);
    setTimeout(() => setLoading(false), 2000);
  };

  const formatPublicKey = (key) => {
    if (key.length > 26) {
      return (
        <div>
          <span className="text-blue-400">{key.slice(0, 26)}</span>
          <br />
          <span className="text-blue-400">{key.slice(26)}</span>
        </div>
      );
    }
    return <span className="text-blue-400">{key}</span>;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicKey).then(
      () => setCopySuccess(true),
      () => setCopySuccess(false)
    );
  };

  return (
    <div>
      {/* Navigation Bar */}
      <div className="navbar">
        <h2>🚀 Stellar Wallet</h2>
        <div className="menu">
          <a href="#">Home</a>
          <a href="#">About</a>
        </div>
      </div>

      {/* Main Container */}
      <div className="container">
        <header>
          <p>InnoView Indo Tech</p>
        </header>

        {/* Form Container */}
        <div className="form-container">
          <p>Dompet ini belum aktif, kirim 1 XLM ke alamat berikut:</p>
          <p className="mt-2">{formatPublicKey(publicKey)}</p>

          <button className="copy-btn" onClick={copyToClipboard}>
            {copySuccess ? "✅ Berhasil!" : "💾 Salin Public Key"}
          </button>
        </div>

        <button className="bg-indigo-500" onClick={onSubmit} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Footer Navigation */}
      <div className="footer-nav">
        <p>© 2025 InnoView Indo Tech</p>
      </div>
    </div>
  );
};

export default Start;
