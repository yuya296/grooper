export interface Clock {
  now(): number;
}

export const systemClock: Clock = {
  now: () => Date.now()
};

export const fixedClock = (now: number): Clock => ({
  now: () => now
});
