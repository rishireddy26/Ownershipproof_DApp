import { useState, useEffect } from 'react';
import UploadForm from './components/UploadForm';
import UserGallery from './components/UserGallery';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [hovering, setHovering] = useState(false);
  const [pageTransition, setPageTransition] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    checkConnection();
    window.ethereum?.on('accountsChanged', checkConnection);
    return () => {
      window.ethereum?.removeListener('accountsChanged', checkConnection);
    };
  }, []);

  useEffect(() => {
    if (account) {
      setPageTransition(true);
      const timer = setTimeout(() => {
        setShowContent(true);
        setPageTransition(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPageTransition(true);
      const timer = setTimeout(() => {
        setShowContent(false);
        setPageTransition(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [account]);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]);
        } else {
          setIsConnected(false);
          setAccount('');
        }
      } catch (error) {
        console.error("Error checking connection:", error);
        setIsConnected(false);
        setAccount('');
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const button = document.querySelector('.connect-button');
        if (button) button.classList.add('clicked');
        
        setTimeout(async () => {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setIsConnected(true);
          setAccount(accounts[0]);
          if (button) button.classList.remove('clicked');
        }, 300);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        const button = document.querySelector('.connect-button');
        if (button) button.classList.remove('clicked');
      }
    } else {
      alert("Please install MetaMask! 🦊");
    }
  };

  const disconnectWallet = async () => {
    try {
      setPageTransition(true);
      setTimeout(() => {
        setIsConnected(false);
        setAccount('');
        
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      }, 300);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  // Format account address for display
  const formatAddress = (address) => {
    return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient">
            📜 Ownership Proof DApp
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Securely register and verify ownership of your digital content using blockchain technology
          </p>
        </div>

        <div className={`page-transition-container ${pageTransition ? 'transitioning' : ''}`}>
          {account && showContent ? (
            <div className="content-container fade-in">
              <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm p-4 rounded-lg shadow-lg">
                <div className="flex items-center justify-center space-x-2 text-center mb-4">
                  <span className="inline-block h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-gray-300">
                    Connected: <span className="font-medium text-indigo-400">{formatAddress(account)}</span>
                  </p>
                </div>
              </div>
              <UploadForm account={account} onDisconnect={disconnectWallet} />
              <UserGallery account={account} />
            </div>
          ) : !account && !showContent ? (
            <div className="login-container fade-in">
              <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-md mx-auto">
                <p className="text-xl mb-8">
                  🔐 Connect your wallet to get started with secure content registration
                </p>
                <button
                  onClick={connectWallet}
                  onMouseEnter={() => setHovering(true)}
                  onMouseLeave={() => setHovering(false)}
                  className="connect-button bg-indigo-600 text-white font-medium px-8 py-3 rounded-md hover:bg-indigo-700 transition-all duration-300 shadow-md transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center space-x-2 mx-auto"
                >
                  <span>{hovering ? '🦊' : '👛'}</span>
                  <span>Connect Wallet</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <footer className="mt-16 text-center text-gray-400 text-sm">
          <p>💫 Secure your digital creations on the blockchain</p>
        </footer>
      </div>
      
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        
        .page-transition-container {
          position: relative;
          min-height: 400px;
          transition: opacity 0.5s ease;
        }
        
        .page-transition-container.transitioning {
          opacity: 0;
        }
        
        .content-container, .login-container {
          animation: fadeIn 0.5s ease forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .connect-button.clicked {
          transform: scale(0.95);
          box-shadow: 0 0 15px rgba(79, 70, 229, 0.6);
        }
      `}</style>
    </div>
  );
}

export default App;
