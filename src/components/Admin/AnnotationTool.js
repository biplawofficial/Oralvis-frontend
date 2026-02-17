import React, { useState, useEffect, useRef } from 'react';
import './Admin.css';

const AnnotationTool = ({ submission, onBack, onSaveAnnotation }) => {
  const [findings, setFindings] = useState({
    upperTeeth: submission?.findings?.upperTeeth || '',
    frontTeeth: submission?.findings?.frontTeeth || '',
    recededGums: submission?.findings?.recededGums || false,
    stains: submission?.findings?.stains || false,
    attrition: submission?.findings?.attrition || false,
    lowerTeeth: submission?.findings?.lowerTeeth || '',
    crowns: submission?.findings?.crowns || false,
    otherFindings: submission?.findings?.otherFindings || ''
  });
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageAnnotations, setImageAnnotations] = useState(() =>
    Array.isArray(submission?.findings?.annotations) 
      ? submission.findings.annotations
      : (Array.isArray(submission?.imageURLs)
          ? submission.imageURLs.map(() => ({ annotations: [] }))
          : [])
  );
  const [currentTool, setCurrentTool] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentColor, setCurrentColor] = useState('#532E5E');
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const prevImageUrlsRef = useRef([]);

  const colorOptions = [
    { name: 'Inflammed / Red gums', value: '#532E5E' },
    { name: 'Malaligned', value: '#F5D953' },
    { name: 'Receded gums', value: '#B2A0C2' },
    { name: 'Stains', value: '#D33E3E' },
    { name: 'Attrition', value: '#58C3D1' },
    { name: 'Crowns', value: '#D93685' }
  ];

  const currentAnnotations = imageAnnotations[currentImageIndex]?.annotations || [];

  useEffect(() => {
    if (!submission) return;

    if (submission.findings) {
      setFindings(submission.findings);
    }

    if (Array.isArray(submission.imageURLs)) {
      // Initialize annotations if not present
      if (!submission.findings?.annotations) {
        setImageAnnotations(submission.imageURLs.map(() => ({ annotations: [] })));
      }
      fetchImages(submission.imageURLs);
    } else {
      setImageUrls([]);
    }

    setCurrentImageIndex(0);
  }, [submission]);

  // Fixed canvas synchronization with proper image scaling
  useEffect(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!img || !canvas || !container) return;

    const handleLoad = () => {
      // Calculate displayed image dimensions (accounting for CSS scaling)
      const containerWidth = container.clientWidth;
      const scale = containerWidth / img.naturalWidth;
      const displayedHeight = img.naturalHeight * scale;
      
      // Set canvas dimensions to match displayed image size
      canvas.width = containerWidth;
      canvas.height = displayedHeight;
      
      // Update container height to match scaled image
      container.style.height = `${displayedHeight}px`;
      
      redrawCanvas();
    };

    img.addEventListener('load', handleLoad);
    // If image is already loaded, trigger manually
    if (img.complete) handleLoad();

    // Handle window resize
    const handleResize = () => {
      if (img.complete) handleLoad();
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      img.removeEventListener('load', handleLoad);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentImageIndex, imageUrls]);

  useEffect(() => {
    if (imageUrls.length > 0 && canvasRef.current) redrawCanvas();
  }, [imageUrls, imageAnnotations, currentImageIndex]);

  useEffect(() => {
    return () => {
      prevImageUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
      prevImageUrlsRef.current = [];
    };
  }, []);

  // Fixed coordinate calculation to account for image scaling
  const getCanvasRelativePos = (e) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const container = containerRef.current;
    
    if (!canvas || !img || !container) return { x: 0, y: 0 };
    
    const rect = container.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    return { x, y };
  };

  const handleMouseDown = (e) => {
    if (!currentTool) return;
    const { x, y } = getCanvasRelativePos(e);
    setStartPos({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentTool) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x: currentX, y: currentY } = getCanvasRelativePos(e);
    redrawCanvas();

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;

    if (currentTool === 'rectangle') {
      // Draw temporary rectangle while dragging
      ctx.strokeRect(startPos.x, startPos.y, currentX - startPos.x, currentY - startPos.y);
    }
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !currentTool) return;

    const { x: endX, y: endY } = getCanvasRelativePos(e);
    const pxPerCm = 37.8;
    const targetSize = 0.4 * pxPerCm;
    let newAnnotation = null;

    if (currentTool === 'rectangle') {
      const width = endX - startPos.x;
      const height = endY - startPos.y;

      if (Math.abs(width) < targetSize || Math.abs(height) < targetSize) {
        newAnnotation = {
          type: 'rectangle',
          x: startPos.x,
          y: startPos.y,
          width: targetSize,
          height: targetSize,
          color: currentColor
        };
      } else {
        newAnnotation = {
          type: 'rectangle',
          x: startPos.x,
          y: startPos.y,
          width,
          height,
          color: currentColor
        };
      }
    }

    setImageAnnotations(prev => {
      const copy = [...prev];
      if (!copy[currentImageIndex]) copy[currentImageIndex] = { annotations: [] };
      copy[currentImageIndex].annotations = [...(copy[currentImageIndex].annotations || []), newAnnotation];
      return copy;
    });

    setIsDrawing(false);
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const container = containerRef.current;
    
    if (!canvas || !img || !container) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scaling factors
    const scaleX = canvas.width / img.naturalWidth;
    const scaleY = canvas.height / img.naturalHeight;

    const anns = imageAnnotations[currentImageIndex]?.annotations || [];
    anns.forEach(ann => {
      ctx.strokeStyle = ann.color;
      ctx.lineWidth = 2;
      
      if (ann.type === 'rectangle') {
        // Scale the annotation coordinates to match the displayed image size
        const x = ann.x * scaleX;
        const y = ann.y * scaleY;
        const width = ann.width * scaleX;
        const height = ann.height * scaleY;
        
        ctx.strokeRect(x, y, width, height);
      }
    });
  };

  const fetchImages = async (imagePaths) => {
    if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
      setImageUrls([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const urls = [];

      prevImageUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
      prevImageUrlsRef.current = [];

      for (const imagePath of imagePaths) {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/admin/get-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ imagePath })
        });

        if (!res.ok) throw new Error('Image not found');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        urls.push(url);
        prevImageUrlsRef.current.push(url);
      }

      setImageUrls(urls);
    } catch (err) {
      console.error('Error fetching images:', err);
      setImageUrls([]);
      prevImageUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
      prevImageUrlsRef.current = [];
    }
  };

  const nextImage = () => {
    setCurrentImageIndex(i => Math.min(i + 1, imageUrls.length - 1));
  };

  const prevImage = () => {
    setCurrentImageIndex(i => Math.max(i - 1, 0));
  };

  const handleFindingChange = (field, value) => {
    setFindings(prev => ({ ...prev, [field]: value }));
  };

  // Modified to only save to backend without downloading
  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/admin/submission/${submission._id}/generate-report`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        const err = await response.text();
        alert(err || 'Failed to generate report');
        return;
      }

      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report');
    } finally {
      setLoading(false);
    }
  };

  // Fixed annotation saving
  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const findingsWithAnnotations = { 
        ...findings, 
        annotations: imageAnnotations 
      };

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/admin/submission/${submission._id}/annotate`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ findings: findingsWithAnnotations })
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert('Annotations saved successfully!');
        if (onSaveAnnotation) onSaveAnnotation(data.submission);
      } else {
        alert(data.message || 'Error saving annotations');
      }
    } catch (error) {
      console.error(error);
      alert('Error saving annotations');
    } finally {
      setLoading(false);
    }
  };

  const clearAnnotations = () => {
    setImageAnnotations(prev => {
      const copy = [...prev];
      if (!copy[currentImageIndex]) copy[currentImageIndex] = { annotations: [] };
      copy[currentImageIndex].annotations = [];
      return copy;
    });
  };

  return (
    <div className="annotation-tool">
      <div className="tool-header">
        <button onClick={onBack} className="btn btn-back">&larr; Back to List</button>
        <h2>Annotation Tool</h2>
        <div className="patient-info">
          <h3>{submission.name} (ID: {submission.patientID})</h3>
          <p>Phone: {submission.phone} | Submitted: {new Date(submission.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="annotation-content">
        <div className="image-section">
          <div className="image-container" ref={containerRef}>
            {imageUrls.length > 0 ? (
              <>
                <div className="image-navigation">
                  <button onClick={prevImage} disabled={currentImageIndex === 0}>Previous</button>
                  <span>Image {currentImageIndex + 1} of {imageUrls.length}</span>
                  <button onClick={nextImage} disabled={currentImageIndex === imageUrls.length - 1}>Next</button>
                </div>

                <img
                  ref={imageRef}
                  src={imageUrls[currentImageIndex]}
                  alt="Teeth for annotation"
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />

                <canvas
                  ref={canvasRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    cursor: currentTool ? 'crosshair' : 'default',
                    zIndex: 1,
                    pointerEvents: currentTool ? 'auto' : 'none'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                />
              </>
            ) : (
              <p>Loading images...</p>
            )}
          </div>
        </div>

        <div className="tools-panel">
          <h3>Dental Findings</h3>

          <div className="findings-form">
            <div className="form-group">
              <label>Upper Teeth:</label>
              <textarea 
                value={findings.upperTeeth} 
                onChange={(e) => handleFindingChange('upperTeeth', e.target.value)}
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Front Teeth:</label>
              <textarea 
                value={findings.frontTeeth} 
                onChange={(e) => handleFindingChange('frontTeeth', e.target.value)}
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Lower Teeth:</label>
              <textarea 
                value={findings.lowerTeeth} 
                onChange={(e) => handleFindingChange('lowerTeeth', e.target.value)}
                rows="3"
              />
            </div>
            
            <div className="checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={findings.recededGums} 
                  onChange={(e) => handleFindingChange('recededGums', e.target.checked)}
                />
                Receded Gums
              </label>
              
              <label>
                <input 
                  type="checkbox" 
                  checked={findings.stains} 
                  onChange={(e) => handleFindingChange('stains', e.target.checked)}
                />
                Stains
              </label>
              
              <label>
                <input 
                  type="checkbox" 
                  checked={findings.attrition} 
                  onChange={(e) => handleFindingChange('attrition', e.target.checked)}
                />
                Attrition
              </label>
              
              <label>
                <input 
                  type="checkbox" 
                  checked={findings.crowns} 
                  onChange={(e) => handleFindingChange('crowns', e.target.checked)}
                />
                Crowns
              </label>
            </div>
            
            <div className="form-group">
              <label>Other Findings:</label>
              <textarea 
                value={findings.otherFindings} 
                onChange={(e) => handleFindingChange('otherFindings', e.target.value)}
                rows="3"
              />
            </div>
          </div>

          <div className="annotation-tools">
            <h4>Annotation Tools</h4>
            <div className="tool-buttons">
              <button 
                className={currentTool === 'rectangle' ? 'active' : ''} 
                onClick={() => setCurrentTool('rectangle')}
              >
                Rectangle
              </button>
              <button onClick={clearAnnotations}>Clear Annotations</button>
            </div>

            <div className="color-picker">
              <h5>Condition Colors</h5>
              <div className="color-options">
                {colorOptions.map((color, index) => (
                  <div
                    key={index}
                    className={`color-option ${currentColor === color.value ? 'selected' : ''}`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    onClick={() => setCurrentColor(color.value)}
                  >
                    <span className="color-name">{color.name}</span>
                  </div>
                ))}
              </div>

              <div className="current-color-display">
                Selected: <span className="color-sample" style={{ backgroundColor: currentColor }}></span>
                {colorOptions.find(c => c.value === currentColor)?.name}
              </div>
            </div>

            <p className="tool-note">Click and drag to draw rectangles (approx. 0.4 cm size)</p>
          </div>

          <div className="action-buttons">
            <button onClick={handleSave} disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Findings'}
            </button>
            <button onClick={handleGenerateReport} disabled={loading} className="btn btn-success">
              {loading ? 'Generating...' : 'Generate PDF Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationTool;