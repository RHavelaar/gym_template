-- Raise gym-assets bucket limit for gallery video and allow gallery MIME types

update storage.buckets
set
  file_size_limit = 52428800, -- 50 MB (matches app MAX_GALLERY_VIDEO_BYTES)
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
where id = 'gym-assets';
