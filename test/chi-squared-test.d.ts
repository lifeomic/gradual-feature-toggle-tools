declare function ChiSquaredTest (observed: number[], expected: number[], reduction: number): {probability: number};

declare module 'chi-squared-test' {
  export = ChiSquaredTest;
}
