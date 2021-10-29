import BN from "bn.js";
import { JsonProperty, Serializable } from "typescript-json-serializer";
import { BNConverter } from "../../../../api/mongo";
import { MetaplexKey } from "../MetaplexKey";
import { BaseEntry } from "./BaseEntry";

@Serializable()
export class PrizeTrackingTicket extends BaseEntry {
  @JsonProperty()
  key: MetaplexKey = MetaplexKey.PrizeTrackingTicketV1;

  @JsonProperty()
  metadata!: string;

  @JsonProperty(BNConverter)
  supplySnapshot!: BN;

  @JsonProperty(BNConverter)
  expectedRedemptions!: BN;

  @JsonProperty(BNConverter)
  redemptions!: BN;

  constructor(args?: {
    metadata: string;
    supplySnapshot: BN;
    expectedRedemptions: BN;
    redemptions: BN;
  }) {
    super();

    if (args) {
      this.metadata = args.metadata;
      this.supplySnapshot = args.supplySnapshot;
      this.expectedRedemptions = args.expectedRedemptions;
      this.redemptions = args.redemptions;
    }
  }
}
