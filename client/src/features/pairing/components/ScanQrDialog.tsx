import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { PAIR_CODE_LENGTH } from '@slip/shared';
import jsQR from 'jsqr';
import { useEffect, useRef, useState } from 'react';

type ScanState = 'requesting' | 'scanning' | 'error' | 'unsupported';

interface ScanQrDialogProps {
  open: boolean;
  onClose: () => void;
  onScanned: (code: string) => void;
}

const CODE_PATTERN = new RegExp(`^\\d{${PAIR_CODE_LENGTH}}$`);

/** Accepts either a raw code or the full pair URL a QR code encodes. */
function extractPairCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (CODE_PATTERN.test(trimmed)) return trimmed;
  try {
    const code = new URL(trimmed).searchParams.get('code');
    if (code && CODE_PATTERN.test(code)) return code;
  } catch {
    // Not a URL — nothing to extract.
  }
  return null;
}

export function ScanQrDialog({ open, onClose, onScanned }: ScanQrDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  const onScannedRef = useRef(onScanned);
  onScannedRef.current = onScanned;
  const [state, setState] = useState<ScanState>('requesting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported');
      return;
    }

    let cancelled = false;
    setState('requesting');
    setErrorMessage(null);

    if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
    const canvas = canvasRef.current;
    let activeStream: MediaStream | null = null;

    // A hard `facingMode: 'environment'` constraint is treated as exact by
    // some browsers and can fail outright (or, on some devices, resolve to
    // a blank/black track) if the device's camera enumeration doesn't match
    // it exactly. `ideal` makes it a preference instead of a requirement,
    // and we still fall back to no constraint at all if that's rejected.
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      .catch(() => navigator.mediaDevices.getUserMedia({ video: true }))
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        activeStream = stream;
        // Deliberately NOT captured before this async gap: MUI's Dialog
        // mounts its content (this <video>) in a render pass that can lag
        // behind the `open` prop flipping, so a ref read at the top of this
        // effect can still be null. By now — after a real getUserMedia
        // round-trip — the element is guaranteed to exist.
        const videoEl = videoRef.current;
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.play().catch((err: unknown) => {
            console.error('[ScanQrDialog] video.play() failed', err);
          });
        }
        setState('scanning');

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const tick = () => {
          const video = videoRef.current;
          if (video && ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const result = jsQR(imageData.data, imageData.width, imageData.height);
            const code = result && extractPairCode(result.data);
            if (code) {
              onScannedRef.current(code);
              return;
            }
          }
          frameRef.current = requestAnimationFrame(tick);
        };
        frameRef.current = requestAnimationFrame(tick);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const name = err instanceof DOMException ? err.name : '';
        setErrorMessage(
          name === 'NotAllowedError' || name === 'PermissionDeniedError'
            ? 'Camera access was denied. Allow camera access in your browser settings to scan a code.'
            : name === 'NotFoundError' || name === 'DevicesNotFoundError'
              ? 'No camera was found on this device.'
              : 'Could not access the camera.',
        );
        setState('error');
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
      activeStream?.getTracks().forEach((track) => track.stop());
      // Deliberately reading the ref live here rather than a captured
      // variable — see the comment above on why this component can't trust
      // an early-captured ref.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Scan QR code
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center" sx={{ pb: 1 }}>
          <Box
            sx={{
              width: '100%',
              aspectRatio: '1',
              backgroundColor: '#000',
              position: 'relative',
            }}
          >
            <video
              ref={videoRef}
              muted
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                // Rounding lives on the video itself, not a wrapping
                // overflow:hidden container — that combination is a known
                // cause of hardware-accelerated <video> rendering solid
                // black on Android Chrome (the rounded-corner clip conflicts
                // with the video's own GPU compositing layer).
                borderRadius: '16px',
                // Always rendered (never display:none) once we might have a
                // stream attached — hiding it while playback starts is a
                // common cause of a video element getting stuck on a blank
                // frame in some browsers.
                display: state === 'error' || state === 'unsupported' ? 'none' : 'block',
              }}
            />
            {state === 'requesting' && (
              <Stack
                sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '16px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                }}
                alignItems="center"
                justifyContent="center"
              >
                <CircularProgress size={28} sx={{ color: '#fff' }} />
              </Stack>
            )}
          </Box>

          {state === 'error' && (
            <Alert severity="error" sx={{ width: '100%', borderRadius: 3 }}>
              {errorMessage}
            </Alert>
          )}
          {state === 'unsupported' && (
            <Alert severity="warning" sx={{ width: '100%', borderRadius: 3 }}>
              This browser doesn&apos;t support camera scanning. Enter the code manually instead.
            </Alert>
          )}
          {state === 'scanning' && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Point your camera at the other device&apos;s QR code.
            </Typography>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
