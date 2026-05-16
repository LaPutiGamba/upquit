import ApplicationException from "../../../../shared/application/exceptions/ApplicationException.js";

export default class OAuthUserNotFoundApplicationException extends ApplicationException {
  public readonly statusCode = 401;
  public readonly errorCode = "OAUTH_USER_NOT_FOUND";

  constructor(provider: string, oauthId: string) {
    super(`OAuth user not found: ${provider}/${oauthId}`);
  }
}
