import UserRepository from "../../domain/contracts/UserRepository.js";
import PasswordHasher from "../../domain/contracts/PasswordHasher.js";
import TokenSigner, { AuthTokenPair, AuthTokenPayload } from "../../domain/contracts/TokenSigner.js";
import Email from "../../domain/value-objects/Email.js";
import InvalidCredentialsException from "../exceptions/InvalidCredentialsException.js";
import AuthenticateUserQuery from "../queries/AuthenticateUserQuery.js";
import BoardRepository from "../../../boards/domain/contracts/BoardRepository.js";

export default class AuthenticateUserQueryHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly boardRepository: BoardRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenSigner: TokenSigner
  ) {}

  async execute(query: AuthenticateUserQuery): Promise<AuthTokenPair> {
    const email = new Email(query.email);
    const user = await this.userRepository.findByEmailIncludingInactive(email);

    if (!user || !user.passwordHash) {
      throw new InvalidCredentialsException();
    }

    if (!user.isActive) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.passwordHasher.compare(query.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const boardIds = await this.boardRepository.findBoardIdsByUserId(user.id);
    const payload: AuthTokenPayload = {
      sub: user.id.getValue(),
      userId: user.id.getValue(),
      boardIds
    };

    return this.tokenSigner.signTokenPair(payload);
  }
}
