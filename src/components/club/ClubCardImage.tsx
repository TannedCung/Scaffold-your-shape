"use client";
import React, { useEffect, useState } from 'react';
import { CardMedia, CircularProgress } from '@mui/material';

interface ClubCardImageProps {
  imageUrl?: string | null;
  alt: string;
}

// Helper: Returns true if URL looks like an R2 object key or URL
function isR2Url(url?: string | null) {
  if (!url) return false;
  // Accept both direct R2 URLs and keys (e.g. club-backgrounds/uuid.jpg)
  return url.startsWith('http') || url.startsWith('club-backgrounds/');
}

export default function ClubCardImage({ imageUrl, alt }: ClubCardImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('imageUrl', imageUrl);
    let ignore = false;
    if (isR2Url(imageUrl)) {
      setLoading(true);
      // If it's a key, not a full URL, extract the key
      const key = imageUrl!.startsWith('http') ? imageUrl!.split('/').slice(-2).join('/') : imageUrl;
      fetch('/api/r2/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
        .then(res => res.json())
        .then(data => {
          if (!ignore && data.url) setSignedUrl(data.url);
        })
        .catch(() => {
          if (!ignore) setSignedUrl(null);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    } else {
      setSignedUrl(null);
    }
    return () => {
      ignore = true;
    };
  }, [imageUrl]);

  // Show loading spinner while fetching signed URL
  if (loading) {
    return <CardMedia component="div" sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#e0f7f3' }}><CircularProgress size={24} color="inherit" /></CardMedia>;
  }

  return (
    <CardMedia
      component="img"
      height="140"
      image={signedUrl || '/club-wallpaper-placeholder.png'}
      alt={alt}
      sx={{ bgcolor: '#e0f7f3' }}
    />
  );
}
