import { csvToList, truncateAddress, formatNumber} from '@/utils/formatData';

export function UserAverageFeedback({data}: {data: any}){
    if(data === undefined) return "Undefined";
    if (csvToList(data.toString())[1] === 0) return "0.00";
    return formatNumber(
        (csvToList(data.toString())[0] as number) / (csvToList(data.toString())[1] as number), 2
    );
}

export function UserSpending({ data }: { data: any }) {
    if (data === undefined) return "Undefined";
    if (csvToList(data.toString())[2] === 0) return "0.00";
    return formatNumber((csvToList(data.toString())[2] as number / 10**18), 2);
}