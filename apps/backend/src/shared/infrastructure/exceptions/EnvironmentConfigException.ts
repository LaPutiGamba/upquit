import InfrastructureException from "./InfrastructureException.js";

export default class EnvironmentConfigException extends InfrastructureException {
  public readonly errorCode = "ENVIRONMENT_CONFIG_ERROR";

  constructor(message: string) {
    super(`Environment Configuration Error: ${message}`);
  }
}
