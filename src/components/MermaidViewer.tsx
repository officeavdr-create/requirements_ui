
// export default MermaidViewer;
import React, { useState, useRef, useEffect } from "react";
import mermaid from 'mermaid';
import { Download, ZoomIn, ZoomOut, Hand, RefreshCw, Image, Copy, CheckCircle, RotateCcw, AlertTriangle } from "lucide-react";
import { downloadFile } from '../utils/download';
import toast from 'react-hot-toast';
import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";

interface MermaidViewerProps {
  code: string;
  title?: string;
  onRegenerate?: () => void; // Add callback for regeneration
}

const MermaidViewer: React.FC<MermaidViewerProps> = ({ 
  code, 
  title = 'Generated Sequence Diagram',
  onRegenerate 
}) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const mermaidWrapperRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [canPan, setCanPan] = useState(false);
  const [renderSuccess, setRenderSuccess] = useState(false);
  const [renderError, setRenderError] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);
  const panOrigin = useRef({ x: 0, y: 0 });

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
    });
  }, []);

  // Countdown timer effect
  useEffect(() => {
    // let timer: NodeJS.Timeout;
    let timer: ReturnType<typeof setTimeout>;
    if (showCountdown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (showCountdown && countdown === 0) {
      // Auto-download after countdown
      // handleDownload();
      setShowCountdown(false);
      setCountdown(10);
    }
    return () => clearTimeout(timer);
  }, [showCountdown, countdown]);

  // useEffect(() => {
  //   if (mermaidRef.current && code) {
  //     // Reset states on new code
  //     setRenderSuccess(false);
  //     setRenderError('');
  //     setShowCountdown(false);
  //     setCountdown(10);
  //     mermaidRef.current.innerHTML = '';

  //     let processedCode = code
  //       .replace(/^\s*```/i, '')
  //       .replace(/^\s*```/, '')
  //       .replace(/```$/m, '')
  //       .trim();

  //     const id = `mermaid-${Date.now()}`;

  //     try {
  //       mermaid.render(id, processedCode)
  //         .then(({ svg }) => {
  //           if (mermaidRef.current) {
  //             mermaidRef.current.innerHTML = svg;
  //             setRenderSuccess(true);
  //             setRenderError('');
  //           }
  //         })
  //         .catch(error => {
  //           console.error('Mermaid rendering error:', error);
  //           setRenderSuccess(false);
  //           setRenderError(error.message || 'Unknown rendering error');
  //           setShowCountdown(true);
            
  //           if (mermaidRef.current) {
  //             mermaidRef.current.innerHTML = `
  //               <div class="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
  //                 <div class="flex items-center justify-center mb-4">
  //                   <AlertTriangle className="h-8 w-8 text-red-600 mr-2" />
  //                   <h3 class="text-lg font-semibold text-red-800">Error Rendering Diagram</h3>
  //                 </div>
  //                 <p class="text-red-700 mb-4">The generated Mermaid code contains syntax errors.</p>
  //                 <p class="text-sm text-red-600 mb-4">Auto-downloading markdown in <span id="countdown">${countdown}</span> seconds...</p>
  //               </div>
  //             `;
  //           }
  //         });
  //     } catch (error: any) {
  //       console.error('Mermaid error:', error);
  //       setRenderSuccess(false);
  //       setRenderError(error.message || 'Unknown error');
  //       setShowCountdown(true);
        
  //       if (mermaidRef.current) {
  //         mermaidRef.current.innerHTML = `
  //           <div class="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
  //             <div class="flex items-center justify-center mb-4">
  //               <AlertTriangle className="h-8 w-8 text-red-600 mr-2" />
  //               <h3 class="text-lg font-semibold text-red-800">Error Rendering Diagram</h3>
  //             </div>
  //             <p class="text-red-700 mb-4">The generated Mermaid code contains syntax errors.</p>
  //             <p class="text-sm text-red-600 mb-4">Auto-downloading markdown in <span id="countdown">${countdown}</span> seconds...</p>
  //           </div>
  //         `;
  //       }
  //     }
  //   }
  // }, [code]);

    useEffect(() => {
    if (mermaidRef.current && code) {
      // Reset everything before rendering
      setRenderSuccess(false);
      setRenderError('');
      setShowCountdown(false);
      setCountdown(10);
      mermaidRef.current.innerHTML = '';

       let processedCode = code
        .replace(/^\s*```mermaid\s*/i, '') // Remove opening ```
        .replace(/^\s*```/, '')            // Remove opening ```
        .replace(/```$/m, '')              // Remove closing ```
        .trim();

      const id = `mermaid-${Date.now()}`;
       try {
      mermaid.render(id, processedCode)
        .then(({ svg }) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
            setRenderSuccess(true);
            setRenderError('');
          }
        })
        .catch(error => {
          console.error('Mermaid rendering error:', error);
          setRenderSuccess(false);
          setRenderError(error.message || 'Unknown rendering error');
          setShowCountdown(true);
          
          // Use HTML string instead of JSX components
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `
              <div class="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
                <div class="flex items-center justify-center mb-4">
                  <svg class="h-8 w-8 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 class="text-lg font-semibold text-red-800">Error Rendering Diagram</h3>
                </div>
                <p class="text-red-700 mb-4">The generated Mermaid code contains syntax errors.</p>
                <p class="text-sm text-red-600 mb-4">Auto-downloading markdown in <span id="countdown">10</span> seconds...</p>
              </div>
            `;
          }
        });
    } catch (error: any) {
      console.error('Mermaid error:', error);
      setRenderSuccess(false);
      setRenderError(error.message || 'Unknown error');
      setShowCountdown(true);
      
      // Use HTML string instead of JSX components
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = `
          <div class="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
            <div class="flex items-center justify-center mb-4">
              <svg class="h-8 w-8 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 class="text-lg font-semibold text-red-800">Error Rendering Diagram</h3>
            </div>
            <p class="text-red-700 mb-4">The generated Mermaid code contains syntax errors.</p>
            <p class="text-sm text-red-600 mb-4">Auto-downloading markdown in <span id="countdown">10</span> seconds...</p>
          </div>
        `;
      }
    }
  }
}, [code]);
  //     try {
  //       mermaid.render(id, processedCode)
  //         .then(({ svg }) => {
  //           if (mermaidRef.current) {
  //             mermaidRef.current.innerHTML = svg;
  //             setRenderSuccess(true);         // <-- only here!
  //             setRenderError('');
  //           }
  //         })
  //         .catch(error => {
  //           setRenderSuccess(false);          // <-- failure, do NOT set true
  //           setRenderError(error.message || 'Unknown rendering error');
  //           setShowCountdown(true);
  //           // ... set error message DOM if desired
  //         });
  //     } catch (error: any) {
  //       setRenderSuccess(false);              // <-- failure, do NOT set true
  //       setRenderError(error.message || 'Unknown error');
  //       setShowCountdown(true);
  //       // ... set error message DOM if desired
  //     }
  //   }
  // }, [code]);

  // Update countdown in DOM
  useEffect(() => {
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
      countdownElement.textContent = countdown.toString();
    }
  }, [countdown]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => { setZoom(1); setDrag({ x: 0, y: 0 }); };
  const handlePanToggle = () => setCanPan(p => !p);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canPan || !mermaidWrapperRef.current) return;
    setIsDragging(true);
    panOrigin.current = { x: e.clientX - drag.x, y: e.clientY - drag.y };
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDrag({
      x: e.clientX - panOrigin.current.x,
      y: e.clientY - panOrigin.current.y,
    });
  };
  
  const handlePointerUp = () => setIsDragging(false);

  const handleDownloadImage = async () => {
    if (!mermaidWrapperRef.current) return;
    const dataUrl = await htmlToImage.toPng(mermaidWrapperRef.current);
    const link = document.createElement("a");
    link.download = "mermaid-diagram.png";
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!mermaidWrapperRef.current) return;
    const dataUrl = await htmlToImage.toPng(mermaidWrapperRef.current);
    const pdf = new jsPDF();
    pdf.addImage(dataUrl, "PNG", 10, 10, 180, 160);
    pdf.save("mermaid-diagram.pdf");
  };

  const handleDownload = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `sequence_diagram_${timestamp}.md`;
    downloadFile(code, filename, 'text/markdown');
    toast.success('Mermaid code downloaded!');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      setShowCountdown(false);
      setCountdown(10);
      onRegenerate();
    }
  };

  if (!code) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      {/* Error State Actions */}
      {!renderSuccess && renderError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-medium">
                {showCountdown ? `Auto-downloading in ${countdown}s` : 'Diagram rendering failed'}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDownload}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                Download Now
              </button>
              {onRegenerate && (
                <button
                  onClick={handleRegenerate}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toolbar - only show if render is successful */}
      {renderSuccess && (
        <div className="bg-gray-100 p-2 rounded-md flex space-x-2 items-center">
          <button onClick={handleDownloadImage} title="Download PNG">
            <Image className="w-5 h-5 text-gray-700 hover:text-primary-600" />
          </button>
          <button onClick={handleDownloadPDF} title="Download PDF">
            <Download className="w-5 h-5 text-gray-700 hover:text-primary-600" />
          </button>
          <button onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="w-5 h-5 text-gray-700 hover:text-primary-600" />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="w-5 h-5 text-gray-700 hover:text-primary-600" />
          </button>
          <button onClick={handlePanToggle} title={canPan ? "Disable Hand Tool" : "Enable Hand Tool"}>
            <Hand className={`w-5 h-5 ${canPan ? 'text-primary-600' : 'text-gray-700'} hover:text-primary-600`} />
          </button>
          <button onClick={handleResetZoom} title="Reset Zoom">
            <RefreshCw className="w-5 h-5 text-gray-700 hover:text-primary-600" />
          </button>
        </div>
      )}

      <div
        ref={mermaidWrapperRef}
        className="relative bg-white border border-gray-300 rounded-lg p-4 overflow-auto"
        style={{
          width: "100%",
          cursor: canPan ? (isDragging ? "grabbing" : "grab") : "default",
          userSelect: canPan ? "none" : "auto",
          transform: renderSuccess ? `translate(${drag.x}px, ${drag.y}px) scale(${zoom})` : "none",
          transition: "transform 0.2s",
        }}
        onPointerDown={renderSuccess ? handlePointerDown : undefined}
        onPointerMove={renderSuccess ? handlePointerMove : undefined}
        onPointerUp={renderSuccess ? handlePointerUp : undefined}
        onPointerLeave={renderSuccess ? handlePointerUp : undefined}
        tabIndex={renderSuccess ? 0 : -1}
      >
        <div ref={mermaidRef} className="mermaid-container" />
      </div>

      <details className="bg-gray-50 border border-gray-200 rounded-lg">
        <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
          View Mermaid Code
        </summary>
        <div className="px-4 pb-4">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
            <code>{code}</code>
          </pre>
        </div>
      </details>
    </div>
  );
};

export default MermaidViewer;
