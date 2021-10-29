import BN from "bn.js";
import { StringPublicKey } from "../../utils";

import { AuctionState } from "../auction";
import { BidState } from "./BidState";
import { PriceFloor } from "./PriceFloor";
import { AuctionManagerV1, AuctionManagerV2 } from "../../../common";
import { Auction } from "../../../types/sourceTypes";
import { ObjectId } from "mongodb";
import { JsonProperty, Serializable } from "typescript-json-serializer";
import { BNConverter, ObjectIdConverter } from "../../serialize";

@Serializable()
export class AuctionData implements Auction {
  @JsonProperty(ObjectIdConverter)
  _id!: ObjectId;

  /// Pubkey of the authority with permission to modify this auction.
  @JsonProperty()
  authority!: StringPublicKey;

  /// Token mint for the SPL token being used to bid
  @JsonProperty()
  tokenMint!: StringPublicKey;

  /// The time the last bid was placed, used to keep track of auction timing.
  @JsonProperty(BNConverter)
  lastBid!: BN | null;

  /// Slot time the auction was officially ended by.
  @JsonProperty(BNConverter)
  endedAt!: BN | null;

  /// End time is the cut-off point that the auction is forced to end by.
  @JsonProperty(BNConverter)
  endAuctionAt!: BN | null;

  /// Gap time is the amount of time in slots after the previous bid at which the auction ends.
  @JsonProperty(BNConverter)
  auctionGap!: BN | null;

  /// Minimum price for any bid to meet.
  @JsonProperty(BNConverter)
  priceFloor!: PriceFloor;

  /// The state the auction is in, whether it has started or ended.
  @JsonProperty()
  state!: AuctionState;

  /// Auction Bids, each user may have one bid open at a time.
  @JsonProperty()
  bidState!: BidState;

  /// Used for precalculation on the front end, not a backend key
  @JsonProperty()
  bidRedemptionKey?: StringPublicKey;

  @JsonProperty()
  managerv1?: AuctionManagerV1;

  @JsonProperty()
  managerv2?: AuctionManagerV2;

  get pubkey() {
    return this._id.toString();
  }

  get manager() {
    const manager = this.managerv1 ?? this.managerv2;
    if (!manager) {
      throw new Error("missing auctionManager");
    }
    return { ...manager, pubkey: this.pubkey };
  }

  constructor(args?: {
    authority: StringPublicKey;
    tokenMint: StringPublicKey;
    lastBid: BN | null;
    endedAt: BN | null;
    endAuctionAt: BN | null;
    auctionGap: BN | null;
    priceFloor: PriceFloor;
    state: AuctionState;
    bidState: BidState;
    totalUncancelledBids: BN;
  }) {
    if (args) {
      this.authority = args.authority;
      this.tokenMint = args.tokenMint;
      this.lastBid = args.lastBid;
      this.endedAt = args.endedAt;
      this.endAuctionAt = args.endAuctionAt;
      this.auctionGap = args.auctionGap;
      this.priceFloor = args.priceFloor;
      this.state = args.state;
      this.bidState = args.bidState;
    }
  }
}
