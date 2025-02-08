// Turn Comma-Separated Data into a list
export function csvToList(csv: string): (string | number)[] {
    if (typeof csv !== 'string') {
        return [0,0,0]
        //throw new Error('csvToList expects a string');
    }
    return csv.split(',').map(value => {
        // Trim whitespace and check if it's a number
        const trimmed = value.trim();
        const num = Number(trimmed);
        return isNaN(num) ? trimmed.replace(/^"|"$/g, '') : num;
    });
}

// Truncate Address to 10 characters
export function truncateAddress(address: string): string {
    if (address.length <= 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Format Number into a proper digit styling
export function formatNumber(value: number | undefined, decimalPlaces = 0): string {
    if (value === undefined) return "N/A"
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    })
}