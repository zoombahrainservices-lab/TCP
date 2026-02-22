import Image from 'next/image'

interface FeatureCardProps {
  icon: string
  text: string
  className?: string
}

export function FeatureCard({ icon, text, className = '' }: FeatureCardProps) {
  return (
    <div 
      className={`flex items-center p-[var(--card-pad)] gap-[var(--card-gap)] bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Icon container - fixed size, prevents shrinking */}
      <div className="flex-shrink-0 w-[var(--icon-size)] h-[var(--icon-size)] relative flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
        <Image 
          src={icon} 
          alt=""
          width={80}
          height={80}
          quality={100}
          className="object-contain w-[80%] h-[80%]"
        />
      </div>
      
      {/* Text content - clamped for height control */}
      <p className="flex-1 text-[length:var(--body-size)] text-gray-800 dark:text-gray-200 leading-relaxed line-clamp-3 [@media(max-height:620px)]:line-clamp-2">
        {text}
      </p>
    </div>
  )
}
