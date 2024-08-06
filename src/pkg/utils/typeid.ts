import { customType } from "drizzle-orm/pg-core";
import { typeid, TypeID } from "typeid-js";
import { z } from "zod";

const typeIdLength = 26;

export const idTypes = {
  account: "acc",
  accountSession: "as",
  request: "req",
} as const;

type IdType = typeof idTypes;
type ReversedIdType = { [K in keyof IdType]: K };

const reversedIdTypes = Object.fromEntries(
  Object.entries(idTypes).map(([x, y]) => [y, x]),
) as ReversedIdType;

type IdTypePrefixes = keyof typeof idTypes;
export type TypeId<T extends IdTypePrefixes> = `${IdType[T]}_${string}`;

export const typeIdValidator = <const T extends IdTypePrefixes>(prefix: T) =>
  z
    .string()
    .startsWith(`${idTypes[prefix]}_`)
    .length(typeIdLength + idTypes[prefix].length + 1) // suffix length + prefix length + underscore
    .transform((input) => TypeID.fromString(input).toString() as TypeId<T>);

export const typeIdGenerator = <const T extends IdTypePrefixes>(prefix: T) =>
  typeid(idTypes[prefix]).toString() as TypeId<T>;

export const typeIdDataType = <const T extends IdTypePrefixes>(prefix: T, columnName: string) =>
  customType<{
    data: TypeId<T>;
    notNull: true;
    driverData: string;
  }>({
    // store the TypeId as uuid in postgres
    dataType: () => "uuid",
    fromDriver: (input) => {
      return TypeID.fromUUID(prefix, input).asType(prefix).toString() as TypeId<T>;
    },
    // store the TypeId as string in postgres
    toDriver(input) {
      return TypeID.fromString(input).toUUID();
    },
  })(columnName);

export const validateTypeId = <const T extends IdTypePrefixes>(
  prefix: T,
  data: unknown,
): data is TypeId<T> => typeIdValidator(prefix).safeParse(data).success;

export const inferTypeId = <T extends keyof ReversedIdType>(input: `${T}_${string}`) =>
  reversedIdTypes[TypeID.fromString(input).getType() as T];
