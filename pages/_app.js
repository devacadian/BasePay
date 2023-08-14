import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { arbitrum, goerli, mainnet, optimism,polygon, zora } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import Head from 'next/head';
import Footer from '../components/Footer';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet, polygon, optimism,arbitrum,zora, ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : []),
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
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
    <Footer />
    </>
  );
}

export default MyApp;