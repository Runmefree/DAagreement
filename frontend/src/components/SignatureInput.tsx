import React, { useRef, useState, useEffect } from 'react';
import '../styles/SignatureInput.css';

interface SignatureInputProps {
  signatureType: string;
  onSignatureChange: (signatureData: string) => void;
}

export const SignatureInput: React.FC<SignatureInputProps> = ({
  signatureType,
  onSignatureChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadedImageData, setUploadedImageData] = useState<string>('');

  // Initialize canvas for drawing
  useEffect(() => {
    if (signatureType === 'drawn') {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    }
  }, [signatureType]);

  // Handle drawn signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL('image/png');
      onSignatureChange(signatureData);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      onSignatureChange('');
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setUploadedImageData(imageData);
        onSignatureChange(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  if (signatureType === 'typed') {
    return (
      <div className="signature-input-container">
        <div className="typed-signature-info">
          <p>Your signature will be displayed in a professional signature font</p>
        </div>
      </div>
    );
  }

  if (signatureType === 'drawn') {
    return (
      <div className="signature-input-container">
        <div className="drawn-signature-area">
          <canvas
            ref={canvasRef}
            className="signature-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <button
            type="button"
            onClick={clearCanvas}
            className="clear-signature-btn"
          >
            Clear Signature
          </button>
        </div>
      </div>
    );
  }

  if (signatureType === 'uploaded') {
    return (
      <div className="signature-input-container">
        <div className="uploaded-signature-area">
          <label htmlFor="signature-upload" className="upload-label">
            <input
              id="signature-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="signature-upload-input"
            />
            <span className="upload-text">
              {uploadedImageData ? '✓ Signature uploaded' : 'Click to upload signature image'}
            </span>
          </label>
          {uploadedImageData && (
            <div className="uploaded-image-preview">
              <img src={uploadedImageData} alt="Signature preview" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default SignatureInput;
