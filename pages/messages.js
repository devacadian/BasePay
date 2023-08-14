import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router'; // Import useRouter
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faBarcodeRead } from '@fortawesome/pro-solid-svg-icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Footer from '../components/Footer';

export default function Messages() {

  return (
    <main className="flex flex-col min-h-screen p-0 bg-white">
    <Head>
      <link rel="canonical" href="https://www.basepay.app" />
      <title>BasePay.app - Go cashless, Go Decentralized!</title>
      <meta name="description" content="BasePay streamlines payments for all social situations, ensuring they're more convenient than before. Go cashless, Go Decentralized with BasePay.app."/>
      <meta property="og:title" content="BasePay.app: Your Decentralized Payment Solution" />
      <meta property="og:description" content="Whether you're organizing a vacation or sharing lunch expenses, BasePay streamlines payments for all social situations." />
      <meta property="og:url" content="https://www.basepay.app" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="BasePay.app: Go cashless, Go Decentralized!"/>
      <meta name="twitter:description" content="BasePay streamlines payments for all social situations, ensuring they're more convenient than before."/>
      <meta name="keywords" content="Crypto, Decentralized, Payments, Wallet, Metamask, BasePay.app, Contacts, Transactions, Ether, Base"/>
    </Head>
    <div className="px-4 pb-4 pt-6 flex items-center">
      <div className="flex items-center border-2 border-blue-500 rounded-3xl w-full p-2">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="pl-2 mr-2 text-black w-6 h-6" />
        <input
          type="text"
          placeholder="Search for an ENS or Base address..."
          className="w-full bg-transparent outline-none"
        />
        </div>
        <FontAwesomeIcon icon={faBarcodeRead} className="ml-4 mr-0 h-8 w-8 text-gray-600" />
      </div>
      <div className="flex-grow flex items-center justify-center">
        <a
          className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
          target="_blank"
          rel="noopener noreferrer"
        >
          {' '}
          <ConnectButton
            className="dark:invert"
            width={100}
            height={24}
            priority
          />
        </a>
      </div>
      <Footer/>
    </main>
  );
}