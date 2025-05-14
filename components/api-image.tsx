'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Newspaper } from 'lucide-react';
import { getCategoryGradient, getCategoryIconColor, getCategoryBgColor } from '@/lib/image-utils';

interface ApiImageProps {
  src?: string | null;
  category?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * A component that handles API images with proper fallbacks
 * This component tries to load the image from the API first,
 * and if that fails, it shows a category-based gradient with an icon
 */
export default function ApiImage({ 
  src, 
  category, 
  alt, 
  className = '', 
  width = 500, 
  height = 300 
}: ApiImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // If there's no source or there was an error loading the image,
  // show the fallback gradient with icon
  if (!src || imageError) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(category)}`}>
          <div className="flex h-full items-center justify-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getCategoryBgColor(category)}`}>
              <Newspaper className={`h-8 w-8 ${getCategoryIconColor(category)}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Try to load the image from the API
  return (
    <div className={`relative w-full h-full ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
        unoptimized
      />
    </div>
  );
}
