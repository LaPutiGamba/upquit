import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import BoardRepository from "../../../boards/domain/contracts/BoardRepository.js";
import TokenSigner, { AuthTokenPayload, AuthTokenPair } from "../../domain/contracts/TokenSigner.js";
import InvalidRefreshTokenException from "../exceptions/InvalidRefreshTokenException.js";
import RefreshAccessTokenQuery from "../queries/RefreshAccessTokenQuery.js";

export default class RefreshAccessTokenQueryHandler {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly tokenSigner: TokenSigner
  ) {}

  async execute(query: RefreshAccessTokenQuery): Promise<AuthTokenPair> {
    let payload: AuthTokenPayload;

    try {
      payload = this.tokenSigner.verifyRefreshToken(query.refreshToken);
    } catch {
      throw new InvalidRefreshTokenException();
    }

    const userId = payload.userId || payload.sub;
    if (!userId) {
      throw new InvalidRefreshTokenException();
    }

    const boardIds = await this.boardRepository.findBoardIdsByUserId(new Uuid(userId));

    return this.tokenSigner.signTokenPair({
      sub: userId,
      userId,
      boardIds
    });
  }
}
