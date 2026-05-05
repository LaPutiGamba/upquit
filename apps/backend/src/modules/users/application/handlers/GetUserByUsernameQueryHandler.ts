import UserRepository from "../../domain/contracts/UserRepository.js";
import GetUserByUsernameQuery from "../queries/GetUserByUsernameQuery.js";
import UserNotFoundException from "../exceptions/UserNotFoundException.js";
import UserResponse, { mapUserToResponse } from "../responses/UserResponse.js";

export default class GetUserByUsernameQueryHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByUsernameQuery): Promise<UserResponse> {
    const user = await this.userRepository.findByUsername(query.username);

    if (!user) {
      throw new UserNotFoundException(`User with username ${query.username} not found`);
    }

    return mapUserToResponse(user);
  }
}
