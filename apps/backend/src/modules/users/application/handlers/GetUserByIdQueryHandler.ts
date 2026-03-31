import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import UserRepository from "../../domain/contracts/UserRepository.js";
import GetUserByIdQuery from "../queries/GetUserByIdQuery.js";
import UserNotFoundException from "../exceptions/UserNotFoundException.js";
import UserResponse, { mapUserToResponse } from "../responses/UserResponse.js";

export default class GetUserByIdQueryHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByIdQuery): Promise<UserResponse> {
    const userId = new Uuid(query.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(query.userId);
    }

    return mapUserToResponse(user);
  }
}
