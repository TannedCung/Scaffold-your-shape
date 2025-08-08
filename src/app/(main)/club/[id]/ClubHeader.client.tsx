"use client";
import { Box, Typography, CircularProgress } from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import React, { useRef, useEffect, useState } from 'react';
import { Club } from '@/types';
import Image from 'next/image';

// Helper: Returns true if URL looks like an R2 object key or URL
function isR2Url(url?: string | null) {
  if (!url) return false;
  // Accept both direct R2 URLs and keys (e.g. club-backgrounds/uuid.jpg)
  return url.startsWith('http') || url.startsWith('club-backgrounds/');
}

export default function ClubHeader({ club }: { club: Club }) {
  const bgRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Handle signed URL fetching for R2 images
  useEffect(() => {
    let ignore = false;
    if (isR2Url(club.backgroundImageUrl)) {
      setImageLoading(true);
      // If it's a key, not a full URL, extract the key
      const key = club.backgroundImageUrl!.startsWith('http') 
        ? club.backgroundImageUrl!.split('/').slice(-2).join('/') 
        : club.backgroundImageUrl;
      
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
          if (!ignore) setImageLoading(false);
        });
    } else {
      setSignedUrl(club.backgroundImageUrl || null);
    }
    return () => {
      ignore = true;
    };
  }, [club.backgroundImageUrl]);

  useEffect(() => {
    function handleScroll() {
      if (!bgRef.current) return;
      const rect = bgRef.current.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const percent = Math.min(Math.max(-rect.top / rect.height, 0), 1);
        setOffset(percent);
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box
      ref={bgRef}
      sx={{
        width: '100%',
        aspectRatio: '21 / 9',
        minHeight: 180,
        maxHeight: 420,
        position: 'relative',
        bgcolor: '#e0f7f3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        px: { xs: 2, sm: 6 },
        py: 0,
        mb: 4,
        borderRadius: 3,
        boxShadow: 1,
        overflow: 'hidden',
        ...(typeof window === 'undefined' ? {} : {
          '@supports not (aspect-ratio: 21 / 9)': {
            paddingTop: '42.85%',
          },
        }),
      }}
    >
      {club.backgroundImageUrl && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          borderRadius: 3,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}>
          {imageLoading ? (
            <Box sx={{
              width: '100%',
              height: '120%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#e0f7f3'
            }}>
              <CircularProgress size={32} sx={{ color: '#2da58e' }} />
            </Box>
          ) : signedUrl ? (
            <Box
              sx={{
                width: '100%',
                height: '120%',
                position: 'absolute',
                top: `-${offset * 10}%`,
                left: 0,
                opacity: 0.22,
                filter: 'blur(1px) saturate(1.1)',
                transition: 'top 0.2s cubic-bezier(0.4,0,0.2,1)',
                borderRadius: 3,
                overflow: 'hidden',
                willChange: 'top',
              }}
            >
              <Image
                src={signedUrl}
                alt={`${club.name} cover`}
                fill
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
                priority
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: `-${offset * 10}%`,
                left: 0,
                opacity: 0.22,
                filter: 'blur(1px) saturate(1.1)',
                transition: 'top 0.2s cubic-bezier(0.4,0,0.2,1)',
                borderRadius: 3,
                overflow: 'hidden',
                willChange: 'top',
              }}
            >
              <Image
                src="/images/club-wallpaper-placeholder.png"
                alt={`${club.name} cover`}
                fill
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            </Box>
          )}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(45,165,142,0.13)',
            borderRadius: 3,
            zIndex: 1,
          }} />
        </Box>
      )}
      <Box sx={{ position: 'relative', zIndex: 2, width: '100%', textAlign: 'center', py: { xs: 2, sm: 4 } }}>
        <DirectionsRunIcon sx={{ fontSize: 60, color: '#2da58e', mb: 1 }} aria-label="Running club icon" />
        <Typography variant="h3" sx={{ color: '#2da58e', fontWeight: 800, textAlign: 'center', mb: 1 }}>
          {club.name}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#24977e', fontWeight: 500, textAlign: 'center', mb: 1 }}>
          Created: {new Date(club.created_at).toLocaleDateString()}
        </Typography>
        <Box sx={{ position: 'absolute', top: 8, right: 16, opacity: 0.12 }}>
          <EmojiEventsIcon sx={{ fontSize: 100, color: '#2da58e' }} aria-label="Finisher badge background icon" />
        </Box>
      </Box>
    </Box>
  );
}
