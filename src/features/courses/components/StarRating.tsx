import React from 'react';
import { Rating, RatingProps } from 'react-simple-star-rating';
import { cn } from '@/lib/utils';

export const StarRating: React.FC<RatingProps> = (props) => {
  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  };

  const svgStyle: React.CSSProperties = {
    display: 'inline-block',
    marginRight: '2px',
  };

  return (
    <div style={containerStyle} className="inline-flex flex-row items-center">
      <Rating
        {...props}
        className={cn('flex flex-row', props.className)}
        SVGstyle={svgStyle}
        style={{ display: 'flex', flexDirection: 'row' }}
      />
    </div>
  );
};
