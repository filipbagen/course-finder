declare module 'react-rating-stars-component' {
  interface ReactStarsProps {
    count?: number;
    value?: number;
    onChange?: (newRating: number) => void;
    size?: number;
    activeColor?: string;
    color?: string;
    char?: string;
    classNames?: string;
    edit?: boolean;
    isHalf?: boolean;
    emptyIcon?: React.ReactElement;
    halfIcon?: React.ReactElement;
    filledIcon?: React.ReactElement;
  }

  const ReactStars: React.ComponentType<ReactStarsProps>;
  export default ReactStars;
}
