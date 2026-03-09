import Image from 'next/image';
import { InlineImageBlock as InlineImageBlockType } from '@/lib/blocks/types';
import { ImageIcon } from 'lucide-react';

export default function InlineImageBlock({ src, alt, caption, width, height }: InlineImageBlockType) {
  // Handle empty or missing src
  if (!src || src.trim() === '') {
    return (
      <figure className="inline-image-block my-4">
        <div className="relative w-full max-w-md aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-400 dark:text-gray-600">
            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="text-xs">No image URL set</p>
          </div>
        </div>
        {caption && (
          <figcaption className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="inline-image-block my-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm">
        {width && height ? (
          <Image
            src={src}
            alt={alt || 'Image'}
            width={width}
            height={height}
            className="w-full h-auto object-cover"
            priority={false}
          />
        ) : (
          <div className="relative w-full aspect-video">
            <Image
              src={src}
              alt={alt || 'Image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 448px"
              priority={false}
            />
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
