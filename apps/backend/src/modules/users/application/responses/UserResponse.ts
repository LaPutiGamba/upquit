import User from "../../domain/entities/User.js";

export default interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date | null;
}

export function mapUserToResponse(user: User): UserResponse {
  return {
    id: user.id.getValue(),
    email: user.email.getValue(),
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    createdAt: user.createdAt
  };
}
