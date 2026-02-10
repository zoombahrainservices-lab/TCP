import Image from 'next/image';
import { ImageBlock as ImageBlockType } from '@/lib/blocks/types';

export default function ImageBlock({ src, alt, caption, width, height }: ImageBlockType) {
  return (
    <figure className="image-block mb-6">
      <div className="relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        {width && height ? (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-auto object-cover"
            priority={false}
          />
        ) : (
          <div className="relative w-full aspect-video">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              priority={false}
            />
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
