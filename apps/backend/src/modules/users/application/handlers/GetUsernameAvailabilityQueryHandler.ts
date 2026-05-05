import UserRepository from "../../domain/contracts/UserRepository.js";
import GetUsernameAvailabilityQuery from "../queries/GetUsernameAvailabilityQuery.js";
import Username from "../../domain/value-objects/Username.js";

export default class GetUsernameAvailabilityQueryHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUsernameAvailabilityQuery): Promise<{ username: string; available: boolean }> {
    const username = new Username(query.username).getValue();
    const existing = await this.userRepository.findByUsernameIncludingInactive(username);

    return {
      username,
      available: !existing
    };
  }
}
