import UserRepository from "../../domain/contracts/UserRepository.js";
import TokenSigner, { AuthTokenPair, AuthTokenPayload } from "../../domain/contracts/TokenSigner.js";
import AuthenticateByOAuthQuery from "../queries/AuthenticateByOAuthQuery.js";
import BoardRepository from "../../../boards/domain/contracts/BoardRepository.js";
import OAuthUserNotFoundApplicationException from "../exceptions/OAuthUserNotFoundApplicationException.js";

export default class AuthenticateByOAuthQueryHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly boardRepository: BoardRepository,
    private readonly tokenSigner: TokenSigner
  ) {}

  async execute(query: AuthenticateByOAuthQuery): Promise<AuthTokenPair> {
    const user = await this.userRepository.findByOAuthId(query.provider, query.oauthId);

    if (!user || !user.isActive) {
      throw new OAuthUserNotFoundApplicationException(query.provider, query.oauthId);
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
