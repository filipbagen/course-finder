declare module 'react-star-ratings' {
  interface StarRatingsProps {
    rating: number;
    starRatedColor?: string;
    starEmptyColor?: string;
    starHoverColor?: string;
    starDimension?: string;
    starSpacing?: string;
    changeRating?: (newRating: number, name?: string) => void;
    numberOfStars?: number;
    name?: string;
    isSelectable?: boolean;
    isAggregateRating?: boolean;
    gradientPathName?: string;
    ignoreInlineStyles?: boolean;
    svgIconPath?: string;
    svgIconViewBox?: string;
    className?: string;
    halfStarEnabled?: boolean;
  }

  export default class StarRatings extends React.Component<StarRatingsProps> {}
}
