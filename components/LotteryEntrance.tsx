"use client";

import { contractAddresses, abi } from "../constants";
// Don't export from moralis when using React
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";
import { useNotification } from "web3uikit";
import { ethers } from "ethers";

export default function LotteryEntrance() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis();
    const chainId: number = parseInt(chainIdHex || "0", 16); // Ensure chainIdHex is defined
    const raffleAddress: string | null = chainId in contractAddresses ? (contractAddresses as any)[chainId][0] : null;

    // State hooks
    const [entranceFee, setEntranceFee] = useState<string>("0");
    const [numberOfPlayers, setNumberOfPlayers] = useState<string>("0");
    const [recentWinner, setRecentWinner] = useState<string>("0");

    const dispatch = useNotification();

    const {
        runContractFunction: enterRaffle,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress || "", // Fallback if raffleAddress is null
        functionName: "enterRaffle",
        msgValue: entranceFee,
        params: {},
    });

    /* View Functions */
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress || "",
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getPlayersNumber } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress || "",
        functionName: "getNumberOfPlayers",
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress || "",
        functionName: "getRecentWinner",
        params: {},
    });

    async function updateUIValues() {
        if (!raffleAddress) return;

        try {
            const entranceFeeFromCall = ((await getEntranceFee()) as any).toString();
            const numPlayersFromCall = ((await getPlayersNumber()) as any).toString();
            const recentWinnerFromCall = (await getRecentWinner()) as string;

            setEntranceFee(entranceFeeFromCall);
            setNumberOfPlayers(numPlayersFromCall);
            setRecentWinner(recentWinnerFromCall);
        } catch (error) {
            console.error("Error updating UI values:", error);
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues();
        }
    }, [isWeb3Enabled]);

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        });
    };

    const handleSuccess = async (tx: any) => {
        try {
            await tx.wait(1);
            updateUIValues();
            handleNewNotification();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-5">
            <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>
            {raffleAddress ? (
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async () =>
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error: Error) => console.error(error),
                            })
                        }
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Raffle"
                        )}
                    </button>
                    <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <div>The current number of players is: {numberOfPlayers}</div>
                    <div>The most recent winner was: {recentWinner}</div>
                </>
            ) : (
                <div>Please connect to a supported chain</div>
            )}
        </div>
    );
}
