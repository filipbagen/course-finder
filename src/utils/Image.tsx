/**
 * Custom Image component mimicking Next.js Image component's basic functionality.
 * Note: This does not include on-the-fly optimization, which requires server-side logic.
 *
 * @param {object} props - Component props.
 * @param {string} props.src - Image source URL.
 * @param {string} props.alt - Alternative text for the image.
 * @param {number} props.width - Image width.
 * @param {string} props.className - Additional CSS classes for the image.
 */
const Image = ({
  src,
  alt,
  width,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  className: string;
}) => {
  // Placeholder for processing src based on quality or other parameters.
  // This would require server-side support or a third-party service for on-the-fly optimization.

  return (
    <div className={className}>
      <img
        src={src}
        alt={alt}
        style={{
          width: width,
          height: '100%',
          objectFit: 'contain',
        }}
        loading="lazy"
      />
    </div>
  );
};

export default Image;
