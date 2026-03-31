import Email from "../../domain/value-objects/Email.js";
import UserRepository from "../../domain/contracts/UserRepository.js";
import GetUserByEmailQuery from "../queries/GetUserByEmailQuery.js";
import UserNotFoundException from "../exceptions/UserNotFoundException.js";
import UserResponse, { mapUserToResponse } from "../responses/UserResponse.js";

export default class GetUserByEmailQueryHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByEmailQuery): Promise<UserResponse> {
    const email = new Email(query.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundException(query.email);
    }

    return mapUserToResponse(user);
  }
}
