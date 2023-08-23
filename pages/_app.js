import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';

import { NotificationProvider } from "../components/NotificationProvider";
import 'react-toastify/dist/ReactToastify.css'; // Import CSS file
import React, { useState, useEffect } from 'react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { goerli, mainnet, baseGoerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import Head from 'next/head';
import Footer from '../components/Footer';
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSignTypedData } from 'wagmi';





const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    baseGoerli, mainnet, goerli, ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : []),
],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'BasePay',
  projectId: '506b82fc41e842c49b2a3809ddb82402',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const isLocal = process.env.NEXT_PUBLIC_ENVIRONMENT === 'local'; 


function AppContent({ Component, pageProps }) {
  const { isConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Effect to set the isClient state to true once the component is mounted
  useEffect(() => {
    setIsClient(true);

    // Check if the viewport width is greater than a specific value
    if (window.innerWidth > 768) { // Change this value to the desired breakpoint
      setIsDesktop(true);
    }

    // Optional: Add a listener to handle window resize
    const handleResize = () => {
      if (window.innerWidth > 768) { // Change this value to the desired breakpoint
        setIsDesktop(true);
      } else {
        setIsDesktop(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize); // Cleanup on unmount
  }, []);

  const domain = {
    name: 'BasePay',
    version: '1',
    chainId: 84531, // Set the appropriate chain ID
  };

  const types = {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  };

  const message = {
    from: {
      name: 'Cow', // Must be a string
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826', // Must be a valid address
    },
    to: {
      name: 'Bob', // Must be a string
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB', // Must be a valid address
    },
    contents: 'Hello, Bob!', // Must be a string
  };

  const { data, isError, isLoading, isSuccess, signTypedData } = useSignTypedData({
    domain,
    message,
    primaryType: 'Person', // Set the appropriate primary type
    types,
  });



  return (
    <>
      <Component {...pageProps} />
    
    
      {isDesktop && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white z-50">
    <div className="text-center text-black">
      <h1 className="text-4xl font-bold text-base-blue mb-4">BasePay</h1>
      <h2 className="text-xl text-black font-semibold">Visit on mobile device to access dApp.</h2>

      <button disabled={isLoading} onClick={() => signTypedData()}>
        Sign in with BasePay
      </button>
      {isSuccess && <div>Signature: {data}</div>}
    </div>
  </div>
)}

{isClient && !isDesktop && !isConnected && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white z-50">
    <div className="text-center text-black">
    <h2 className="text-xl text-black font-semibold pb-4">
        Connect Wallet
      </h2>
      <span className="text-black font-semibold text-2xl mb-4">to start using <span className="text-base-blue font-bold">BasePay</span>!</span>
   
      <div className="-ml-2 flex items-center justify-center mt-6 mb-22">
        <a
          className="pointer-events-none flex place-items-center gap-2 p-8 pointer-events-auto"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ConnectButton className="dark:invert" width={100} height={24} priority />
        </a>
      </div>
    </div>
  </div>
)}




    </>
  );
}

function MyApp({ Component, pageProps }) {

  return (
    <>
      <Head>
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={isLocal ? '/favicon-local.png' : '/favicon.png'} // Change favicon based on the environment
        />
      </Head>
      <NotificationProvider>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider coolMode chains={chains} initialChain={baseGoerli} >
      <AppContent Component={Component} pageProps={pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
    </NotificationProvider>
    <Footer />
    </>
  );
}

export default MyApp;