import Image from 'next/image';
import { ImageBlock as ImageBlockType } from '@/lib/blocks/types';
import { ImageIcon } from 'lucide-react';

export default function ImageBlock({ src, alt, caption, width, height }: ImageBlockType) {
  // Handle empty or missing src
  if (!src || src.trim() === '') {
    return (
      <figure className="image-block mb-6">
        <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-400 dark:text-gray-600">
            <ImageIcon className="w-16 h-16 mx-auto mb-2" />
            <p className="text-sm">No image URL set</p>
            <p className="text-xs mt-1">Click edit to add an image</p>
          </div>
        </div>
        {caption && (
          <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center italic">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="image-block mb-6">
      <div className="relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
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
