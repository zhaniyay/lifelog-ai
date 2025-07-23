import React from 'react'
import { motion } from 'framer-motion'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }

  return (
    <motion.div 
      className={`${sizeClasses[size]} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          repeatType: "reverse",
          ease: "easeInOut" 
        }}
      >
        {/* Outer circle with gradient */}
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="url(#logoGradient)"
          className="drop-shadow-sm"
        />
        
        {/* Inner geometric pattern */}
        <path
          d="M12 16 L20 12 L28 16 L28 24 L20 28 L12 24 Z"
          fill="white"
          fillOpacity="0.9"
        />
        
        {/* Central diamond */}
        <motion.path
          d="M16 20 L20 16 L24 20 L20 24 Z"
          fill="url(#centerGradient)"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        
        {/* Small accent dots */}
        <circle cx="14" cy="18" r="1.5" fill="white" fillOpacity="0.8" />
        <circle cx="26" cy="18" r="1.5" fill="white" fillOpacity="0.8" />
        <circle cx="20" cy="26" r="1.5" fill="white" fillOpacity="0.8" />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8b9ff" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
      </motion.svg>
    </motion.div>
  )
}

// Alternative minimal version
export function LogoMini({ className = '' }: { className?: string }) {
  return (
    <div className={`w-8 h-8 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <circle cx="16" cy="16" r="14" fill="url(#miniGradient)" />
        <path
          d="M10 14 L16 10 L22 14 L22 18 L16 22 L10 18 Z"
          fill="white"
          fillOpacity="0.9"
        />
        <circle cx="16" cy="16" r="3" fill="url(#miniCenter)" />
        
        <defs>
          <linearGradient id="miniGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8b9ff" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="miniCenter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
