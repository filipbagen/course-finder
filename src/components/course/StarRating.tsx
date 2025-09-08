import React from 'react';
import { Rating, RatingProps } from 'react-simple-star-rating';
import { cn } from '@/lib/utils';

export const StarRating: React.FC<RatingProps> = (props) => {
  // Style to ensure horizontal layout
  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    width: 'auto',
  };

  // Style for the SVG stars
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
