import {Web3} from 'web3';
import NetworkState from '@/utils/NetworkState.json';
import { useEffect } from 'react';

import { useSendTransaction } from 'wagmi';

const web3 = new Web3('https://base-sepolia.g.alchemy.com/v2/CIy2ezuBM2p9iHPNXw1jN_SMRelF4Gmq');
const abi = NetworkState.abi;

const contract = new web3.eth.Contract(abi, '0xCEa14b51d4E2811b7799fF29A6B6b532f5B27A87');

export default function TxBuilder(){
    const {data, error, sendTransaction} = useSendTransaction();
    
    async function getAgent(){
        const agent = await contract.methods.agents('0x74EF2a3c2CC1446643Ab59e5b65dd86665521F1c').call();
        console.log('Agent:', agent);
    }

    async function getTransaction(){
        const value = web3.utils.toWei('10', 'ether');
        console.log("Fetching Transaction")
        //const tx = await contract.methods.stake(value)

        const tx = await contract.methods.payAgent('0x74EF2a3c2CC1446643Ab59e5b65dd86665521F1c', value)
        //.send({from: '0x74EF2a3c2CC1446643Ab59e5b65dd86665521F1c'});
        console.log(tx);

        const txData = tx.encodeABI();
        console.log(txData);

        // sendTransaction({
        //     to: '0xCEa14b51d4E2811b7799fF29A6B6b532f5B27A87', // Contract Address
        //     data: txData as any, // Encoded function call
        // });
    }  

    async function getStakeData(){
        const tx = await contract.methods.stake();
        const txData = tx.encodeABI();
        console.log("Stake Data:", txData);
    }



    // async function getEncoded(){
    //     const sig = web3.eth.abi.encodeFunctionCall({

    //     })
    // }

    useEffect(()=>{
        getAgent()
        getTransaction()
        getStakeData()
    }, [])

    return <div className="bg-gray-500 w-full h-32 tex-black rounded-lg my-2">
        Tx Builder Section

        {data?.toString()}
        {error && `Error: ${error?.message}`}
    </div>
}