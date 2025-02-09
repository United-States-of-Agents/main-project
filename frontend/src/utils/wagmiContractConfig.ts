import NetworkState from "./NetworkState.json"
import USA from "./USA.json"

export const networkStateContractConfig = {
    address: '0x04A951420393160617BfBF0017464E256d4C4468',
    abi: NetworkState.abi,
} as const

export const tokenContractConfig = {
    address: '0x2EF308295579A58E1B95cD045B7af2f9ec7931f8',
    abi: USA.abi,
} as const