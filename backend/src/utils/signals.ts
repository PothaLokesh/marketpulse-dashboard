export type TradeSignal = "LONG" | "SHORT" | "NEUTRAL";

export function getSignal(open: number, close: number): TradeSignal {
    if (close > open) return "LONG";
    if (close < open) return "SHORT";
    return "NEUTRAL";
}
