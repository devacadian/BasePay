import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faHouse, faMessages, faDollarSign, faBell, faUser } from '@fortawesome/pro-solid-svg-icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white">
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
      <footer className="fixed bottom-0 left-0 flex w-full h-24 bg-white text-black items-center justify-around border-t-2 border-blue-500">
        <a href="/home" className="flex flex-col items-center font-semibold">
          <FontAwesomeIcon icon={faHouse} />
          <span>Home</span>
        </a>
        <a href="/messages" className="flex flex-col items-center font-semibold">
          <FontAwesomeIcon icon={faMessages} />
          <span>Messages</span>
        </a>
        <a href="/pay-receive" className="flex flex-col items-center font-semibold">
          <FontAwesomeIcon icon={faDollarSign} />
          <span>Pay / Receive</span>
        </a>
        <a href="/notifications" className="flex flex-col items-center font-semibold">
          <FontAwesomeIcon icon={faBell} />
          <span>Notifications</span>
        </a>
        <a href="/profile" className="flex flex-col items-center font-semibold">
          <FontAwesomeIcon icon={faUser} />
          <span>Profile</span>
        </a>
      </footer>
    </main>
  );
}
