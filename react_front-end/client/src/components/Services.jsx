import React from "react";
import { BsShieldFillCheck } from "react-icons/bs";
import { BiSearchAlt } from "react-icons/bi";
import { RiHeart2Fill } from "react-icons/ri";

const ServiceCard = ({ color, title, icon, subtitle }) => (
  <div className="flex flex-row justify-start items-start white-glassmorphism p-3 m-2 cursor-pointer hover:shadow-xl">
    <div className={`w-10 h-10 rounded-full flex justify-center items-center ${color}`}>
      {icon}
    </div>
    <div className="ml-5 flex flex-col flex-1">
      <h3 className="mt-2 text-white text-lg">{title}</h3>
      <p className="mt-1 text-white text-sm md:w-9/12">
        {subtitle}
      </p>
    </div>
  </div>
);

const Services = () => (
  <div className="flex w-full justify-center items-center gradient-bg-services">
    <div className="flex mf:flex-row flex-col items-center justify-between md:p-20 py-12 px-4">
      <div className="flex-1 flex flex-col justify-start items-start">
        <h1 className="text-white text-3xl sm:text-5xl py-2 text-gradient ">
          Achieving a Sustainable Future
          <br />
          by using CarbonX
        </h1>
        <p className="text-left my-2 text-white font-light md:w-9/12 w-11/12 text-base">
        The proposed Carbon Credit Ecosystem utilises blockchain technology to ensure 
        the trading between companies is credible, preventing dishonest dealings, 
        and records and stores carbon emission records on a blockchain for immutability.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-start items-center">
        <ServiceCard
          color="bg-[#2952E3]"
          title="Credible Trading"
          icon={<BsShieldFillCheck fontSize={21} className="text-white" />}
          subtitle="The platform ensures the credibility of carbon credit trading between companies by leveraging blockchain technology. The decentralized nature of the blockchain ensures transparency and prevents dishonest dealings."
        />
        <ServiceCard
          color="bg-[#8945F8]"
          title="Immutability"
          icon={<RiHeart2Fill fontSize={21} className="text-white" />}
          subtitle="Carbon emission records are recorded and stored on a blockchain, ensuring their immutability. This ensures the integrity and reliability of the carbon emission data, making it tamper-resistant."
        />
        <ServiceCard
          color="bg-[#F84550]"
          title="Verification and Audit"
          icon={<BiSearchAlt fontSize={21} className="text-white" />}
          subtitle="The system enables storage and audit of carbon emission records, allowing companies and regulators to validate emissions data easily. This promotes accountability and trust in the carbon credit ecosystem."
        />
      </div>
    </div>
  </div>
);

export default Services;
