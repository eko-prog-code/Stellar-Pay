import React, { useState } from 'react';

const Start = ({ initializeWallet, privateKey, testnet, publicKey }) => {
  const [loading, setLoading] = useState(false);

  const onSubmit = () => {
    setLoading(true);
    initializeWallet(privateKey, testnet);
    setTimeout(() => setLoading(false), 2000);
  };

  // Format Public Key agar wrap jika lebih dari 36 karakter
  const formatPublicKey = (key) => {
    if (key.length > 36) {
      return (
        <React.Fragment>
          <span className="text-blue-400">{key.slice(0, 36)}</span>
          <br />
          <span className="text-blue-400">{key.slice(36)}</span>
        </React.Fragment>
      );
    }
    return <span className="text-blue-400">{key}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-6 md:px-20 w-full">
      <header className="text-center w-full max-w-md">
        <h1 className="text-6xl animate-pulse">🚀</h1>
        <h1 className="text-3xl font-bold mt-2">Stellar Wallet</h1>
        <p className="text-lg text-gray-400">InnoView Indo Tech</p>
      </header>
      
      <div className="mt-6 text-justify w-full max-w-md bg-gray-800 bg-opacity-50 p-6 rounded-2xl shadow-lg backdrop-blur-md border border-gray-700">
        <p className="text-gray-300">Dompet ini belum "nyata" karena belum memenuhi persyaratan saldo minimum. 😞</p>
        <p className="text-gray-300 mt-2">
          Send at least <span className="font-bold text-indigo-400">1 XLM</span> to {formatPublicKey(publicKey)} to make this wallet a reality!
        </p>
        <p className="text-gray-400 mt-4">Jika Anda telah mengirim lumens ke alamat tersebut, harap bersabar, tunggu beberapa detik, lalu tekan tombol 'Refresh'. 🙂</p>
      </div>
      
      <button 
        className={`mt-6 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${loading ? 'bg-gray-600' : 'bg-indigo-500 hover:bg-indigo-700'}`} 
        onClick={onSubmit} 
        disabled={loading}
      >
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  );
};

export default Start;
