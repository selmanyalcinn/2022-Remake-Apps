export {};

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      Home: undefined;
      "Random Game": undefined;
      Daily: undefined;
      Settings: undefined;
      Legal: { type: "privacy" | "terms" };
    }
  }
}
