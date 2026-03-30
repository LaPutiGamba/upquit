import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Slug from "../value-objects/Slug.js";
import HexColor from "../value-objects/HexColor.js";

export default class Board {
  constructor(
    public readonly id: Uuid,
    public slug: Slug,
    public name: string,
    public description: string | null,
    public logoUrl: string | null,
    public primaryColor: HexColor | null,
    public readonly ownerId: Uuid,
    public isPublic: boolean | null,
    public allowAnonymousVotes: boolean | null,
    public giveToGetEnabled: boolean | null,
    public giveToGetVotesReq: number | null,
    public giveToGetCommentsReq: number | null,
    public readonly createdAt: Date | null
  ) {}
}
