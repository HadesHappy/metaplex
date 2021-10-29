import type { Db } from 'mongodb';
import { IReader, ReaderBase } from '../../reader';
import { Connection } from '@solana/web3.js';
import {
  Edition,
  MasterEditionV1,
  MasterEditionV2,
  Metadata,
  MetadataKey,
  MetaMap,
  Store,
  WhitelistedCreator,
} from '../../common';
import { deserialize } from 'typescript-json-serializer';

export class MongoReader extends ReaderBase implements IReader {
  private db!: Db;

  constructor(
    public networkName: string,
    connection: Connection,
    private initOrm: () => Promise<Db>,
  ) {
    super(connection);
  }

  private collection<TKey extends keyof MetaMap>(name: TKey) {
    return this.db.collection<MetaMap[TKey]>(name);
  }

  async init() {
    this.db = await this.initOrm();
  }

  storesCount() {
    return this.collection('stores').countDocuments();
  }
  creatorsCount() {
    return this.collection('creators').countDocuments();
  }
  artworksCount() {
    return this.collection('metadata').countDocuments({
      //$where: '???', // TODO: what is it artwork in db?
    });
  }
  auctionsCount() {
    return this.collection('auctions').countDocuments();
  }

  getStoreIds(): Promise<string[]> {
    return this.collection('stores')
      .distinct('_id')
      .then(list => list.map(p => p.toString()));
  }

  getStores() {
    return this.collection('stores')
      .find({})
      .map(doc => deserialize(doc, Store))
      .toArray();
  }
  getStore(storeId: string) {
    return this.collection('stores')
      .findOne({ _id: storeId })
      .then(doc => (doc ? deserialize(doc, Store) : null));
  }

  getCreatorIds(): Promise<string[]> {
    return this.collection('creators')
      .distinct('_id')
      .then(list => list.map(p => p.toString()));
  }

  getCreators() {
    return this.collection('creators')
      .find({})
      .map(doc => deserialize(doc, WhitelistedCreator))
      .toArray();
  }
  getCreator(storeId: string) {
    const filter: Pick<WhitelistedCreator, 'storeIds'> = {
      storeIds: { $in: [storeId] } as any,
    };
    return this.collection('creators')
      .findOne(filter)
      .then(doc => (doc ? deserialize(doc, WhitelistedCreator) : null));
  }

  getArtworks() {
    return this.collection('metadata')
      .find({
        //$where: '???', // TODO: what is it artwork in db?
      })
      .map(doc => deserialize(doc, Metadata))
      .toArray();
  }
  getArtwork(artId: string) {
    return this.collection('metadata')
      .findOne({ _id: artId })
      .then(doc => (doc ? deserialize(doc, Metadata) : null));
  }
  getEdition(id?: string) {
    return id
      ? this.collection('editions')
          .findOne({ _id: id })
          .then(doc => (doc ? deserialize(doc, Edition) : null))
      : Promise.resolve(null);
  }
  getMasterEdition(id?: string) {
    return id
      ? this.collection('masterEditions')
          .findOne({ _id: id })
          .then((doc: any) =>
            !doc
              ? null
              : doc.key === MetadataKey.MasterEditionV1
              ? deserialize(doc, MasterEditionV1)
              : deserialize(doc, MasterEditionV2),
          )
      : Promise.resolve(null);
  }
}
