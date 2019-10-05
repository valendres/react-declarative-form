export type KeyofBase = keyof any;
export type Diff<T extends KeyofBase, U extends KeyofBase> = ({ [P in T]: P } &
    { [P in U]: never } & { [x: string]: never })[T];

export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

export enum Environment {
    ReactNative,
    ReactDom,
    Node,
}
