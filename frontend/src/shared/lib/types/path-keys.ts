type Leaf = string | number | boolean | bigint | symbol | null | undefined | Date;

export type PathKeys<T> = T extends Leaf
  ? never
  : T extends readonly unknown[]
    ? never
    : {
        [K in keyof T & string]: T[K] extends Leaf
          ? K
          : T[K] extends object
            ? `${K}.${PathKeys<T[K]>}`
            : K;
      }[keyof T & string];
