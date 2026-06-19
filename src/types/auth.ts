export const userRoles = ["superadmin", "free", "silver", "gold", "special"] as const;

export type UserRole = (typeof userRoles)[number];

export type AuthUser = {
  displayName: string;
  email: string;
  role: UserRole;
  uid: string;
};

export type AuthSession = {
  expiresAt: number;
  idToken: string;
  refreshToken: string;
  user: AuthUser;
};
