import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import { NotificationProvider } from "../components/NotificationProvider";
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { goerli, mainnet, baseGoerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import Head from 'next/head';
import Footer from '../components/Footer';
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { GoogleAnalytics } from "nextjs-google-analytics";


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
const GID = process.env.NEXT_PUBLIC_GID

function AppContent({ Component, pageProps }) {
  const { isConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);

  // Effect to set the isClient state to true once the component is mounted
  useEffect(() => {
    setIsClient(true);
  }, []);


  return (
    <>

      <Component {...pageProps} />


{isClient && !isConnected && (
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
          href={isLocal ? '/favicon-local.ico' : '/favicon.ico'} // Change favicon based on the environment
        />
      </Head>
      <GoogleAnalytics gaMeasurementId={GID} trackPageViews/>
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