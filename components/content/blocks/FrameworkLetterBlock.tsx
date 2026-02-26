import type { FrameworkLetterBlock as Props } from '@/lib/blocks/types';

export default function FrameworkLetterBlock({
  letter,
  title,
  content,
  image,
}: Props) {
  const _unused = { letter, title };

  return (
    <div className="framework-letter mt-2 mb-6">
      {image && (
        <img
          src={image}
          alt={`${letter} illustration`}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      {/* Body copy only – page title above supplies the heading */}
      <div className="prose dark:prose-invert max-w-none">
        {content.split('\n\n').map((paragraph, i) => (
          <p key={i} className="text-lg leading-relaxed mb-4">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
