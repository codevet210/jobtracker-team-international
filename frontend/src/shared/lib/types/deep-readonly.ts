export type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | undefined
  | null;

type DeepReadonlyTuple<T extends readonly unknown[]> = T extends readonly []
  ? readonly []
  : T extends readonly [infer Head, ...infer Tail]
    ? readonly [DeepReadonly<Head>, ...DeepReadonlyTuple<Tail>]
    : readonly DeepReadonly<T[number]>[];

export type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends (...args: never[]) => unknown
    ? T
    : T extends Map<infer K, infer V>
      ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
      : T extends ReadonlyMap<infer K, infer V>
        ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
        : T extends Set<infer V>
          ? ReadonlySet<DeepReadonly<V>>
          : T extends ReadonlySet<infer V>
            ? ReadonlySet<DeepReadonly<V>>
            : T extends readonly unknown[]
              ? DeepReadonlyTuple<T>
              : T extends object
                ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
                : T;
