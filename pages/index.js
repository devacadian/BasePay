import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faMessages, faDollarSign, faBell, faUser, faMagnifyingGlass, faBarcodeRead } from '@fortawesome/pro-solid-svg-icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen p-0 bg-white">
      <div className="px-4 pb-4 pt-6 flex items-center">
        <div className="flex items-center border-2 border-blue-500 rounded-3xl w-full p-2">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="pl-2 mr-2 text-black" />
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
      <footer className="relative flex w-full h-24 bg-white text-black items-center justify-around border-t-2 border-blue-500">
        <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 w-[60px] h-[60px] rounded-full bg-blue-500 border-b-2 border-blue-500 flex items-center justify-center">
          <FontAwesomeIcon icon={faDollarSign} className="w-8 h-8 text-white" />
        </div>
        <a href="/home" className="flex flex-col items-center font-semibold">
          <FontAwesomeIcon icon={faHouse} />
          <span>Home</span>
        </a>
        <a href="/messages" className="flex flex-col items-center font-semibold">
          <FontAwesomeIcon icon={faMessages} />
          <span>Messages</span>
        </a>
        <a href="/pay-receive" className="flex flex-col items-center font-semibold invisible">
          <span>Pay</span>
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
