import Image from 'next/image'
import Link from 'next/link'

export default function NavLogo({ 
  height = 40,
  width = 175,
  onClick
}: { 
  height?: number
  width?: number
  onClick?: () => void
}) {
  return (
    <Link href="/dashboard" className="hover:opacity-80 transition-opacity" onClick={onClick}>
      <Image 
        src="/TCP-Logo.svg" 
        alt="TCP" 
        width={width}
        height={height}
        className="object-contain"
      />
    </Link>
  )
}
