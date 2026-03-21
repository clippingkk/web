import type React from 'react'

interface AnimatedBackgroundProps {
  className?: string
  backgroundImage?: string
  children?: React.ReactNode
}

const AnimatedBackground = ({
  className = '',
  backgroundImage,
  children,
}: AnimatedBackgroundProps) => {
  return (
    <div className={`relative h-52 w-full md:h-60 lg:h-72 ${className}`}>
      {/* Multi-layered Animated Background */}
      <div className="absolute inset-0 h-full w-full overflow-hidden rounded-t-3xl">
        {/* Custom background image or default gradient */}
        {backgroundImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : (
          <>
            {/* Primary gradient layer */}
            <div className="animate-gradient-xy absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"></div>

            {/* Secondary shimmer layer */}
            <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            {/* Organic shapes overlay */}
            <div className="absolute inset-0 opacity-30">
              <div className="animate-float absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-white/20 blur-xl"></div>
              <div className="animate-float-delayed absolute top-1/2 right-1/4 h-24 w-24 rounded-full bg-white/15 blur-lg"></div>
              <div className="animate-float-slow absolute bottom-1/4 left-1/3 h-20 w-20 rounded-full bg-white/25 blur-md"></div>
            </div>

            {/* Subtle noise texture */}
            <div className='bg-[url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)" opacity="0.4"/%3E%3C/svg%3E")] absolute inset-0 opacity-10'></div>
          </>
        )}

        {/* Gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>

      {/* Content overlay */}
      {children}
    </div>
  )
}

export default AnimatedBackground
