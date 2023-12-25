import React, { useContext, useState, useEffect } from "react";
import { AiFillPlayCircle } from "react-icons/ai";
import { SiEthereum } from "react-icons/si";
import { BsInfoCircle } from "react-icons/bs";

import { TransactionContext } from "../context/TransactionContext";
import { shortenAddress } from "../utils/shortenAddress";
import { Loader } from ".";

const companyCommonStyles = "min-h-[70px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-sm font-light text-white";

const Input = ({ placeholder, name, type, value, handleChange }) => (
  <input
    placeholder={placeholder}
    type={type}
    step="0.0001"
    value={value}
    onChange={(e) => handleChange(e, name)}
    className="my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white border-none text-sm white-glassmorphism"
  />
);

const Welcome = () => {
  const { currentAccount, connectWallet, handleChange, sendTransaction, formData, isLoading } = useContext(TransactionContext);
  const [carbonPrice, setCarbonPrice] = useState(64);
  const [ethPrice, setEthPrice] = useState(64);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchCarbonPrice = async () => {
      try {
        const response = await fetch('https://api.dovu.earth/api/carbon/price');
        const data = await response.json();
        const newCarbonPrice = data.data.price; 
        setCarbonPrice(newCarbonPrice);
      } catch (error) {
        console.error('Error fetching Carbon price:', error);
      }
    };

    fetchCarbonPrice();
  }, []);
  
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR');
        const data = await response.json();
        const newEthPrice = data.EUR; 
        setEthPrice(newEthPrice);
      } catch (error) {
        console.error('Error fetching Carbon price:', error);
      }
    };

    fetchEthPrice();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const { addressTo, amount, keyword, message } = formData;

    if (!addressTo || !amount || !keyword || !message || !ethPrice) return;

    const ethValue = carbonPrice * amount / ethPrice;

    setShowConfirmation(true);
  };

  const handleConfirmPayment = () => {
    setShowConfirmation(false);
  
    const { addressTo, amount, keyword, message } = formData;
  
    if (!ethPrice || !amount || isNaN(ethPrice) || isNaN(amount)) {
      console.log("Invalid ethPrice or amount");
      return;
    }
  
    const ethValue = carbonPrice * amount / ethPrice;
  
    const confirmed = window.confirm(`You are about to send ${ethValue} ETH. Do you want to proceed?`);
  
    if (!confirmed) {
      return;
    }

    // Construct the transaction object
    const transactionObject = {
      to: addressTo,
      value: window.ethereum.utils.toWei(ethValue.toString(), "ether"),
      data: keyword,
      gas: 21000, // Or specify the desired gas limit
    };

    // Send the transaction using MetaMask
    window.ethereum
      .request({
        method: "eth_sendTransaction",
        params: [transactionObject],
      })
      .then((transactionHash) => {
        console.log("Transaction Hash:", transactionHash);
        // Add your desired logic after the transaction is sent successfully
      })
      .catch((error) => {
        console.log("An error occurred:", error);
        // Add your error handling logic here
      });
  };

  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4">
        <div className="flex flex-1 justify-start items-start flex-col mf:mr-10">
          <h1 className="text-3xl sm:text-5xl text-white text-gradient py-1">
            Trading Carbon Credit across the world
          </h1>
          <p className="text-left mt-5 text-white font-light md:w-9/12 w-11/12 text-base">
            Tracking and Trading Carbon Credits easily on CarbonX.
          </p>
          {!currentAccount && (
            <button
              type="button"
              onClick={connectWallet}
              className="flex flex-row justify-center items-center my-5 bg-[#2952e3] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]"
            >
              <AiFillPlayCircle className="text-white mr-2" />
              <p className="text-white text-base font-semibold">
                Connect your Wallet through MetaMask
              </p>
            </button>
          )}
        </div>

        <div className="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10">
          <div className="p-3 flex justify-end items-start flex-col rounded-xl h-30 sm:w-96 w-full my-5 eth-card .white-glassmorphism ">
            <div className="flex justify-between flex-col w-full h-full">
              <div className="flex justify-between items-start">
                {/* ...existing code... */}
              </div>
              <div>
                <p className="text-white font-light text-ms">
                  {currentAccount}
                </p>
                <p className="text-white font-semibold text-lg mt-1">
                  Check your address ↑
                </p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism mt-5">
            <h2 className="text-2xl text-white text-center mb-4">
              Send Carbon Credits
            </h2>
            <form onSubmit={handleSubmit} className="w-full">
              <Input
                placeholder="Recipient Address"
                name="addressTo"
                type="text"
                value={formData.addressTo}
                handleChange={handleChange}
              />
              <Input
                placeholder="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                handleChange={handleChange}
              />
              <Input
                placeholder="Keyword"
                name="keyword"
                type="text"
                value={formData.keyword}
                handleChange={handleChange}
              />
              <Input
                placeholder="Message"
                name="message"
                type="text"
                value={formData.message}
                handleChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirmation(true)}
                className="w-full bg-[#2952e3] p-3 mt-4 rounded-full cursor-pointer hover:bg-[#2546bd]"
              >
                {isLoading ? (
                  <Loader color="#fff" />
                ) : (
                  <SiEthereum className="text-white text-xl" />
                )}
                <span className="text-white text-base font-semibold ml-2">
                  Send
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg max-w-md">
            <p className="text-xl font-semibold mb-4">
              Confirm Payment
            </p>
            <p className="mb-4">
              You are about to send {carbonPrice * formData.amount / ethPrice} ETH. Do you want to proceed?
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 ml-4 bg-gray-300 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Welcome;
