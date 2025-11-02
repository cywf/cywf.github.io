import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidViewerProps {
  diagrams: { name: string; content: string }[];
}

export function MermaidViewer({ diagrams }: MermaidViewerProps) {
  const [selectedDiagram, setSelectedDiagram] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({ 
        startOnLoad: false, 
        theme: 'dark',
        securityLevel: 'loose',
      });
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    if (!initialized || !containerRef.current || diagrams.length === 0) return;

    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(
          `mermaid-${selectedDiagram}`,
          diagrams[selectedDiagram].content
        );
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Failed to render Mermaid diagram:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="alert alert-error">
              <span>Failed to render diagram. Please check the syntax.</span>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [selectedDiagram, diagrams, initialized]);

  if (diagrams.length === 0) {
    return (
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>No diagrams found. Add .mmd files to visualize architecture and workflows.</span>
      </div>
    );
  }

  return (
    <div>
      <div className="tabs tabs-boxed mb-4">
        {diagrams.map((diagram, index) => (
          <button
            key={index}
            className={`tab ${index === selectedDiagram ? 'tab-active' : ''}`}
            onClick={() => setSelectedDiagram(index)}
          >
            {diagram.name}
          </button>
        ))}
      </div>
      <div 
        ref={containerRef} 
        className="bg-base-200 p-6 rounded-lg overflow-x-auto"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}
