export const bannerPlacementIdMap = {
  top: 'banner-position-top',
} as const;

export type BannerPlaceProps = {
  placement: keyof typeof bannerPlacementIdMap;
};

export const BannerPlace = ({ placement }: BannerPlaceProps) => {
  return <div id={bannerPlacementIdMap[placement]}></div>;
};
