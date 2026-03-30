import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Slug from "../value-objects/Slug.js";
import HexColor from "../value-objects/HexColor.js";

export default class Board {
  constructor(
    id: string,
    slug: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly logoUrl: string | null,
    primaryColor: string | null,
    ownerId: string,
    public readonly isPublic: boolean | null,
    public readonly allowAnonymousVotes: boolean | null,
    public readonly giveToGetEnabled: boolean | null,
    public readonly giveToGetVotesReq: number | null,
    public readonly giveToGetCommentsReq: number | null,
    public readonly createdAt: Date | null
  ) {
    this.id = new Uuid(id);
    this.slug = new Slug(slug);
    this.primaryColor = primaryColor ? new HexColor(primaryColor) : null;
    this.ownerId = new Uuid(ownerId);
  }

  public readonly id: Uuid;
  public readonly slug: Slug;
  public readonly primaryColor: HexColor | null;
  public readonly ownerId: Uuid;
}
