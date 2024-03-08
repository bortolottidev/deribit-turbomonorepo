export type PERPETUAL_INSTRUMENT = "BTC-PERPETUAL";
export type FUTURE_INSTRUMENT = `BTC-${number}${string}${number}`;

export type Future = {
  insertedAt: number;
  expirationTimestamp: number;
  instrument: PERPETUAL_INSTRUMENT | FUTURE_INSTRUMENT;
  lastTrade: {
    price: number;
  };
};

export type SpreadFuture = {
  insertedAt: number;
  expirationTimestamp: number;
  perpetual: PERPETUAL_INSTRUMENT;
  instrument: FUTURE_INSTRUMENT;
  perpetualPrice: number;
  instrumentPrice: number;
  spreadUsd: number;
  spreadPercent: number;
  spreadAnnualized: number;
};
