import { db } from "@/database";
import type { AccountDbType } from "@/database/schema";
import { CustomLuciaAuthAdapter } from "@/pkg/auth/lucia.adapter";
import { COOKIE_SESSION } from "@/pkg/const/values";
import { appEnv } from "@/pkg/env/env";
import type { TypeId } from "@/pkg/utils/typeid";
import { Lucia, TimeSpan } from "lucia";

const devMode = appEnv.NODE_ENV === "development";

const adapter = new CustomLuciaAuthAdapter(db);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: devMode ? new TimeSpan(1, "d") : new TimeSpan(4, "w"),
  sessionCookie: {
    name: COOKIE_SESSION,
    attributes: {
      secure: !devMode,
    },
  },
  getSessionAttributes: ({ account }) => ({ account }),
  getUserAttributes: (user) => user,
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
    UserId: number;
  }
  interface DatabaseSessionAttributes {
    account: AuthAccount;
    device: string;
    os: string;
  }
  interface DatabaseUserAttributes {
    id: number;
    publicId: TypeId<"account">;
    role: AccountDbType["role"];
  }
}

export interface AuthAccount {
  id: number;
  publicId: TypeId<"account">;
  role: AccountDbType["role"];
}

export interface AuthSession {
  sessionToken: string;
  account: AuthAccount;
  expiresAt: Date;
}
