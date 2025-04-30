import React, { useEffect, useState } from 'react';
import { CardMedia, CircularProgress } from '@mui/material';

interface ChallengeCardImageProps {
  imageUrl: string | null | undefined;
  alt: string;
  sx?: React.CSSProperties;
}

function isR2Url(url: string | null | undefined) {
  if (!url) return false;
  // Accept both R2 public base URL and direct key
  return url.includes('r2') || url.startsWith('public/');
}

export default function ChallengeCardImage({ imageUrl, alt, sx }: ChallengeCardImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
          if (!ignore) setSignedUrl(data.url);
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

  if (loading) {
    return <CardMedia component="div" sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#e0f7f3', ...sx }}><CircularProgress size={24} color="inherit" /></CardMedia>;
  }

  return (
    <CardMedia
      component="img"
      height="140"
      image={signedUrl || imageUrl || '/challenge-wallpaper-placeholder.png'}
      alt={alt}
      sx={{ bgcolor: '#e0f7f3', ...sx }}
    />
  );
}
