import { useReadContract, useAccount } from 'wagmi'
import { tokenContractConfig } from '@/utils/wagmiContractConfig';

export default function Balance({address}: {address: string}){
    const contractConfig = {
        ...tokenContractConfig,
        functionName: 'balanceOf',
        args: [address], 
    }
    const {data, error, isPending} = useReadContract(contractConfig as any);

    if(isPending){
        return "Loading..."
    };
    if(error){
        return `Not Found`
    };
    
    //return `${data?.toString().slice(0, data.toString().length - 18)}`;
    return formatNumber(Number(data)/10**18 as number|undefined, 2);
}

function formatNumber(value: number | undefined, decimalPlaces = 0): string {
    if (value === undefined) return "N/A"
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    })
}
  