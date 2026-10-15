export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};
export type PublicUser = Omit<User, "passwordHash" | "salt">;
