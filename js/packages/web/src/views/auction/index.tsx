import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Button, Skeleton, Carousel } from 'antd';
import { AuctionCard } from '../../components/AuctionCard';
import {
  AuctionView as Auction,
  AuctionViewItem,
  useArt,
  useAuction,
  useBidsForAuction,
  useCreators,
  useExtendedArt,
} from '../../hooks';
import { ArtContent } from '../../components/ArtContent';
import { format } from 'timeago.js';
import './index.less';
import {
  formatTokenAmount,
  Identicon,
  MetaplexModal,
  shortenAddress,
  useConnectionConfig,
  useMint,
  useWallet,
  AuctionState,
} from '@oyster/common';
import { MintInfo } from '@solana/spl-token';
import useWindowDimensions from '../../utils/layout';
import { CheckOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { MetaAvatar } from '../../components/MetaAvatar';
import { AmountLabel } from '../../components/AmountLabel';

export const AuctionItem = ({
  item,
  index,
  size,
  active,
}: {
  item: AuctionViewItem;
  index: number;
  size: number;
  active?: boolean;
}) => {
  const id = item.metadata.pubkey;
  var style: React.CSSProperties = {
    transform:
      index === 0
        ? ''
        : `translate(${index * 15}px, ${-40 * index}px) scale(${Math.max(
            1 - 0.2 * index,
            0,
          )})`,
    transformOrigin: 'right bottom',
    position: index !== 0 ? 'absolute' : 'static',
    zIndex: -1 * index,
    marginLeft: size > 1 && index === 0 ? '0px' : 'auto',
    background: 'black',
    boxShadow: 'rgb(0 0 0 / 10%) 12px 2px 20px 14px',
    aspectRatio: '1/1',
  };
  return (
    <ArtContent
      pubkey={id}
      className="artwork-image stack-item"
      style={style}
      active={active}
      allowMeshRender={true}
    />
  );
};

export const AuctionView = () => {
  const { id } = useParams<{ id: string }>();
  const { env } = useConnectionConfig();
  const auction = useAuction(id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const art = useArt(auction?.thumbnail.metadata.pubkey);
  const { ref, data } = useExtendedArt(auction?.thumbnail.metadata.pubkey);
  const creators = useCreators(auction);
  const edition = '1 of 1';
  const nftCount = auction?.items.flat().length;
  const winnerCount = auction?.items.length;

  const hasDescription = data === undefined || data.description === undefined;
  const description = data?.description;

  const items = [
    ...(auction?.items
      .flat()
      .reduce((agg, item) => {
        agg.set(item.metadata.pubkey.toBase58(), item);
        return agg;
      }, new Map<string, AuctionViewItem>())
      .values() || []),
    auction?.participationItem,
  ].map((item, index, arr) => {
    if (!item || !item?.metadata || !item.metadata?.pubkey) {
      return null;
    }

    return (
      <AuctionItem
        key={item.metadata.pubkey.toBase58()}
        item={item}
        index={index}
        size={arr.length}
        active={index === currentIndex}
      />
    );
  });

  return (
    <Row justify="center" ref={ref} gutter={[48, 0]}>
      <Col span={24} md={10} className={"img-cont-500"}>
        <div className="auction-view" style={{ minHeight: 300 }}>
          <Carousel
            autoplay={false}
            afterChange={index => setCurrentIndex(index)}
          >
            {items}
          </Carousel>
        </div>
        <h6 className={'about-nft-collection'}>
          ABOUT THIS {nftCount === 1 ? 'NFT' : 'COLLECTION'}
        </h6>
        <p className={'about-nft-collection a-description'}>
          {hasDescription && <Skeleton paragraph={{ rows: 3 }} />}
          {description ||
            (winnerCount !== undefined && (
              <div style={{ fontStyle: 'italic' }}>
                No description provided.
              </div>
            ))}
        </p>
        {/* {auctionData[id] && (
            <>
              <h6>About this Auction</h6>
              <p>{auctionData[id].description.split('\n').map((t: string) => <div>{t}</div>)}</p>
            </>
          )} */}
      </Col>

      <Col span={24} md={14}>
        <h2 className="art-title">
          {art.title || <Skeleton paragraph={{ rows: 0 }} />}
        </h2>
        <Row gutter={[44, 0]}>
          <Col span={12} md={16}>
            <div className={'info-container'}>
              <div className={'info-component'}>
                <h6 className={'info-title'}>CREATED BY</h6>
                <span>{<MetaAvatar creators={creators} />}</span>
              </div>
              <div className={'info-component'}>
                <h6 className={'info-title'}>Edition</h6>
                <span>
                  {(auction?.items.length || 0) > 1 ? 'Multiple' : edition}
                </span>
              </div>
              <div className={'info-component'}>
                <h6 className={'info-title'}>Winners</h6>
                <span>
                  {winnerCount === undefined ? (
                    <Skeleton paragraph={{ rows: 0 }} />
                  ) : (
                    winnerCount
                  )}
                </span>
              </div>
              <div className={'info-component'}>
                <h6 className={'info-title'}>NFTS</h6>
                <span>
                  {nftCount === undefined ? (
                    <Skeleton paragraph={{ rows: 0 }} />
                  ) : (
                    nftCount
                  )}
                </span>
              </div>
            </div>
          </Col>
          <Col span={12} md={8}>
            <div className={'info-view-container'}>
              <div className={'info-view'}>
                <h6 className={'info-title'}>View on</h6>
                <div style={{ display: 'flex' }}>
                  <Button
                    className="tag"
                    onClick={() => window.open(art.uri || '', '_blank')}
                  >
                    Arweave
                  </Button>
                  <Button
                    className="tag"
                    onClick={() =>
                      window.open(
                        `https://explorer.solana.com/account/${
                          art?.mint || ''
                        }${env.indexOf('main') >= 0 ? '' : `?cluster=${env}`}`,
                        '_blank',
                      )
                    }
                  >
                    Solana
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {!auction && <Skeleton paragraph={{ rows: 6 }} />}
        {auction && (
          <AuctionCard auctionView={auction} hideDefaultAction={false} />
        )}
        <AuctionBids auctionView={auction} />
      </Col>
    </Row>
  );
};

const BidLine = (props: {
  bid: any;
  index: number;
  mint?: MintInfo;
  isCancelled?: boolean;
  isActive?: boolean;
}) => {
  const { bid, index, mint, isCancelled, isActive } = props;
  const { wallet } = useWallet();
  const bidder = bid.info.bidderPubkey.toBase58();
  const isme = wallet?.publicKey?.toBase58() === bidder;

  return (
    <Row className={'bid-history'}
    >
      {isCancelled && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: 1,
            background: 'grey',
            top: 'calc(50% - 1px)',
            zIndex: 2,
          }}
        />
      )}
      <Col span={8}>
        {!isCancelled && (
          <div className={'flex '}>
            {isme && (
              <>
                <CheckOutlined />
                &nbsp;
              </>
            )}
            <AmountLabel
              style={{ marginBottom: 0, fontSize: '16px' }}
              containerStyle={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
              displaySOL={true}
              iconSize={24}
              amount={formatTokenAmount(bid.info.lastBid, mint)}
            />
          </div>
        )}
      </Col>
      <Col span={8} style={{opacity: 0.7}}>
        {/* uses milliseconds */}
        {format(bid.info.lastBidTimestamp.toNumber() * 1000)}
      </Col>
      <Col span={8}>
        <div className={'flex-right'}>
          <Identicon
            style={{
              width: 24,
              height: 24,
              marginRight: 10,
              marginTop: 2,
            }}
            address={bidder}
          />{' '}
          <span style={{opacity: 0.7}}>{shortenAddress(bidder)}</span>
        </div>
      </Col>
    </Row>
  );
};

export const AuctionBids = ({
  auctionView,
}: {
  auctionView?: Auction | null;
}) => {
  const bids = useBidsForAuction(auctionView?.auction.pubkey || '');

  const mint = useMint(auctionView?.auction.info.tokenMint);
  const { width } = useWindowDimensions();

  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  const winnersCount = auctionView?.auction.info.bidState.max.toNumber() || 0;
  const activeBids = auctionView?.auction.info.bidState.bids || [];
  const activeBidders = useMemo(() => {
    return new Set(activeBids.map(b => b.key.toBase58()));
  }, [activeBids]);

  const auctionState = auctionView
    ? auctionView.auction.info.state
    : AuctionState.Created;
  const bidLines = useMemo(() => {
    let activeBidIndex = 0;
    return bids.map((bid, index) => {
      let isCancelled =
        (index < winnersCount && !!bid.info.cancelled) ||
        (auctionState !== AuctionState.Ended && !!bid.info.cancelled);

      let line = (
        <BidLine
          bid={bid}
          index={activeBidIndex}
          key={index}
          mint={mint}
          isCancelled={isCancelled}
          isActive={!bid.info.cancelled}
        />
      );

      if (!isCancelled) {
        activeBidIndex++;
      }

      return line;
    });
  }, [auctionState, bids, activeBidders]);

  if (!auctionView || bids.length < 1) return null;

  return (
    <Row>
      <Col style={{ width: '100%', paddingLeft: '24px', paddingRight: '24px' }}>
        <h6 className={'info-title'}>Bid History</h6>
        {bidLines.slice(0, 10)}
        {bids.length > 10 && (
          <div
            className="full-history"
            onClick={() => setShowHistoryModal(true)}
            style={{
              cursor: 'pointer',
            }}
          >
            View full history
          </div>
        )}
        <MetaplexModal
          visible={showHistoryModal}
          onCancel={() => setShowHistoryModal(false)}
          title="Bid history"
          bodyStyle={{
            background: 'unset',
            boxShadow: 'unset',
            borderRadius: 0,
          }}
          centered
          width={width < 768 ? width - 10 : 600}
        >
          <div
            style={{
              maxHeight: 600,
              overflowY: 'scroll',
              width: '100%',
            }}
          >
            {bidLines}
          </div>
        </MetaplexModal>
      </Col>
    </Row>
  );
};
