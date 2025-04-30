import React, { useState, useRef, DragEvent } from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';
import { jsPDF } from 'jspdf';
import LadderDiagram from './components/LadderDiagram';

const AppContainer = styled.div`
  background-color: #1a1a1a;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #ffffff;
`;

const Header = styled.header`
  background-color: #2a2a2a;
  padding: 1rem;
  border-bottom: 2px solid #FFD700;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  color: #FFD700;
  margin: 0;
  font-size: 1.8rem;
`;

const MainContent = styled.main`
  display: flex;
  flex: 1;
  padding: 1rem;
  gap: 1rem;
`;

const EditorContainer = styled.div`
  flex: 1;
  border: 1px solid #FFD700;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AnalysisPanel = styled.div`
  width: 300px;
  background-color: #2a2a2a;
  border: 1px solid #FF4136;
  border-radius: 4px;
  padding: 1rem;
`;

const AnalysisHeader = styled.h2`
  color: #FF4136;
  margin-top: 0;
  font-size: 1.2rem;
  border-bottom: 1px solid #FF4136;
  padding-bottom: 0.5rem;
`;

const Button = styled.button`
  background-color: #FFD700;
  color: #1a1a1a;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: #FF4136;
    color: #ffffff;
  }
`;

const DropZone = styled.div<{ isDragging: boolean }>`
  border: 2px dashed ${props => props.isDragging ? '#FF4136' : '#FFD700'};
  background-color: ${props => props.isDragging ? 'rgba(255, 65, 54, 0.1)' : 'transparent'};
  border-radius: 4px;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  margin-bottom: 1rem;

  &:hover {
    background-color: rgba(255, 215, 0, 0.1);
  }
`;

const DropZoneText = styled.p`
  color: #FFD700;
  margin: 0;
  font-size: 1.1rem;
`;

const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #2a2a2a;
  border-radius: 4px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  background-color: #FFD700;
  color: #1a1a1a;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: #FF4136;
    color: #ffffff;
  }
`;

const FileName = styled.span`
  color: #FFD700;
`;

const DownloadLink = styled.a`
  color: #FFD700;
  text-decoration: none;
  &:hover {
    color: #FF4136;
  }
`;

const ViewerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ViewerContent = styled.div`
  background: #2a2a2a;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #FFD700;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
`;

const CloseButton = styled(Button)`
  position: absolute;
  top: 1rem;
  right: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  background-color: ${props => props.active ? '#FFD700' : '#2a2a2a'};
  color: ${props => props.active ? '#1a1a1a' : '#FFD700'};
  border: 1px solid #FFD700;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.active ? '#FFD700' : '#3a3a3a'};
  }
`;

function App() {
  const [code, setCode] = useState('// Enter your PLC program here...');
  const [analysis, setAnalysis] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'code' | 'ladder'>('code');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const lines = code.split('\n');
    let y = 20;
    
    // Add title
    doc.setFontSize(16);
    doc.text('PLC Program', 20, y);
    y += 15;

    // Add code section
    doc.setFontSize(12);
    doc.text('Code View:', 20, y);
    y += 10;
    
    lines.forEach(line => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 7;
    });

    // Add ladder logic section
    doc.addPage();
    y = 20;
    doc.setFontSize(16);
    doc.text('Ladder Logic View:', 20, y);
    y += 20;

    // Parse the code for ladder logic
    const rungs = parsePLCCode(code);
    
    rungs.forEach((rung, rungIndex) => {
      // Draw rung number
      doc.setFontSize(10);
      doc.text(`${rungIndex + 1}`, 15, y + 10);
      
      // Draw power rails
      doc.setLineWidth(0.5);
      doc.line(20, y, 20, y + 20); // Left rail
      doc.line(190, y, 190, y + 20); // Right rail
      
      // Draw horizontal power line
      doc.line(20, y + 10, 190, y + 10);
      
      // Draw contacts
      let x = 30;
      rung.contacts.forEach((contact) => {
        switch (contact.type) {
          case 'NO':
            drawNOContact(doc, x, y, contact.name);
            break;
          case 'NC':
            drawNCContact(doc, x, y, contact.name);
            break;
          case 'Coil':
            drawCoil(doc, x, y, contact.name);
            break;
          case 'Timer':
            drawTimer(doc, x, y, contact.name, contact.value);
            break;
          case 'Counter':
            drawCounter(doc, x, y, contact.name, contact.value);
            break;
          case 'Compare':
            drawCompare(doc, x, y, contact.name);
            break;
          case 'Set':
            drawSet(doc, x, y, contact.name);
            break;
          case 'Reset':
            drawReset(doc, x, y, contact.name);
            break;
        }
        x += 40;
      });
      
      y += 30;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    // Generate PDF URL
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
  };

  const drawNOContact = (doc: jsPDF, x: number, y: number, name: string) => {
    doc.rect(x, y + 5, 30, 10);
    doc.setFontSize(8);
    doc.text(name, x + 15, y + 11, { align: 'center' });
  };

  const drawNCContact = (doc: jsPDF, x: number, y: number, name: string) => {
    doc.rect(x, y + 5, 30, 10);
    doc.line(x, y + 5, x + 30, y + 15);
    doc.setFontSize(8);
    doc.text(name, x + 15, y + 11, { align: 'center' });
  };

  const drawCoil = (doc: jsPDF, x: number, y: number, name: string) => {
    doc.circle(x + 15, y + 10, 5);
    doc.setFontSize(8);
    doc.text(name, x + 15, y + 11, { align: 'center' });
  };

  const drawTimer = (doc: jsPDF, x: number, y: number, name: string, value?: string) => {
    doc.rect(x, y + 2, 35, 15);
    doc.setFontSize(6);
    doc.text('TMR', x + 17.5, y + 6, { align: 'center' });
    doc.setFontSize(8);
    doc.text(name, x + 17.5, y + 11, { align: 'center' });
    if (value) {
      doc.setFontSize(6);
      doc.text(value, x + 17.5, y + 15, { align: 'center' });
    }
  };

  const drawCounter = (doc: jsPDF, x: number, y: number, name: string, value?: string) => {
    doc.rect(x, y + 2, 35, 15);
    doc.setFontSize(6);
    doc.text('CTR', x + 17.5, y + 6, { align: 'center' });
    doc.setFontSize(8);
    doc.text(name, x + 17.5, y + 11, { align: 'center' });
    if (value) {
      doc.setFontSize(6);
      doc.text(value, x + 17.5, y + 15, { align: 'center' });
    }
  };

  const drawCompare = (doc: jsPDF, x: number, y: number, name: string) => {
    doc.rect(x, y + 5, 35, 10);
    doc.setFontSize(6);
    doc.text('CMP', x + 17.5, y + 9, { align: 'center' });
    doc.setFontSize(8);
    doc.text(name, x + 17.5, y + 13, { align: 'center' });
  };

  const drawSet = (doc: jsPDF, x: number, y: number, name: string) => {
    doc.rect(x, y + 5, 30, 10);
    doc.setFontSize(8);
    doc.text('S', x + 15, y + 3, { align: 'center' });
    doc.text(name, x + 15, y + 11, { align: 'center' });
  };

  const drawReset = (doc: jsPDF, x: number, y: number, name: string) => {
    doc.rect(x, y + 5, 30, 10);
    doc.setFontSize(8);
    doc.text('R', x + 15, y + 3, { align: 'center' });
    doc.text(name, x + 15, y + 11, { align: 'center' });
  };

  const parsePLCCode = (code: string): Array<{ contacts: Array<{ type: string; name: string; value?: string }> }> => {
    const rungs: Array<{ contacts: Array<{ type: string; name: string; value?: string }> }> = [];
    let currentRung: Array<{ type: string; name: string; value?: string }> = [];

    const lines = code.split('\n');
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('Network')) {
        if (currentRung.length > 0) {
          rungs.push({ contacts: currentRung });
        }
        currentRung = [];
      } else if (trimmedLine.startsWith('LD')) {
        const contact = trimmedLine.split(' ')[1];
        currentRung.push({
          type: trimmedLine.includes('LDN') ? 'NC' : 'NO',
          name: contact
        });
      } else if (trimmedLine.startsWith('AND')) {
        const contact = trimmedLine.split(' ')[1];
        currentRung.push({
          type: trimmedLine.includes('ANDN') ? 'NC' : 'NO',
          name: contact
        });
      } else if (trimmedLine.startsWith('TON')) {
        const [_, timer, time] = trimmedLine.split(' ');
        currentRung.push({
          type: 'Timer',
          name: timer,
          value: time
        });
      } else if (trimmedLine.startsWith('ST')) {
        const coil = trimmedLine.split(' ')[1];
        currentRung.push({
          type: 'Coil',
          name: coil
        });
      }
    });

    if (currentRung.length > 0) {
      rungs.push({ contacts: currentRung });
    }

    return rungs;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const lines = code.split('\n');
    let y = 20;
    
    // Add title
    doc.setFontSize(16);
    doc.text('PLC Program', 20, y);
    y += 10;
    
    // Add content
    doc.setFontSize(12);
    lines.forEach(line => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 7;
    });

    doc.save('plc-program.pdf');
  };

  const analyzePLC = () => {
    const results: string[] = [];
    
    if (code.includes('E_STOP')) {
      results.push('✓ Emergency stop implemented');
    } else {
      results.push('⚠ No emergency stop found');
    }

    if (code.includes('SENSOR')) {
      results.push('✓ Sensor inputs detected');
    }

    if (code.includes('FAULT')) {
      results.push('✓ Fault detection implemented');
    }

    if (code.includes('TON') || code.includes('TIMER')) {
      results.push('✓ Timer functionality present');
    }

    if (code.includes('AND') && code.includes('OR')) {
      results.push('✓ Logic operations implemented');
    }

    const networks = code.split('Network').length - 1;
    results.push(`ℹ Found ${networks} networks`);

    setAnalysis(results);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      analyzePLC();
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const downloadSampleProgram = async () => {
    try {
      const response = await fetch('/plc-analyzer/samples/conveyor.plc');
      const text = await response.text();
      setCode(text);
      analyzePLC();
    } catch (error) {
      console.error('Error loading sample program:', error);
    }
  };

  return (
    <AppContainer>
      <Header>
        <Title>PLC Analyzer</Title>
        <ButtonGroup>
          <Button onClick={analyzePLC}>Analyze Program</Button>
          <Button onClick={generatePDF}>View as PDF</Button>
          <Button onClick={downloadPDF}>Download PDF</Button>
        </ButtonGroup>
      </Header>
      <MainContent>
        <EditorContainer>
          <FileUploadContainer>
            <DropZone
              isDragging={isDragging}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <DropZoneText>
                {isDragging 
                  ? 'Drop your PLC program here'
                  : 'Drag and drop your PLC program here, or click to select a file'
                }
              </DropZoneText>
            </DropZone>
            <ButtonContainer>
              <FileInput
                type="file"
                accept=".txt,.plc"
                onChange={handleFileUpload}
                ref={fileInputRef}
                id="file-upload"
              />
              {fileName && <FileName>Current file: {fileName}</FileName>}
              <DownloadLink 
                href="/plc-analyzer/samples/conveyor.plc" 
                download="conveyor.plc"
                onClick={(e) => {
                  e.preventDefault();
                  downloadSampleProgram();
                }}
              >
                Download Sample Program
              </DownloadLink>
            </ButtonContainer>
          </FileUploadContainer>
          <ViewToggle>
            <ToggleButton 
              active={viewMode === 'code'} 
              onClick={() => setViewMode('code')}
            >
              Code View
            </ToggleButton>
            <ToggleButton 
              active={viewMode === 'ladder'} 
              onClick={() => setViewMode('ladder')}
            >
              Ladder Logic
            </ToggleButton>
          </ViewToggle>
          {viewMode === 'code' ? (
            <Editor
              height="100%"
              defaultLanguage="plaintext"
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
              }}
            />
          ) : (
            <LadderDiagram code={code} />
          )}
        </EditorContainer>
        <AnalysisPanel>
          <AnalysisHeader>Analysis Results</AnalysisHeader>
          {analysis.map((result, index) => (
            <p key={index}>{result}</p>
          ))}
        </AnalysisPanel>
      </MainContent>
      {pdfUrl && (
        <ViewerContainer onClick={() => setPdfUrl(null)}>
          <ViewerContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={() => setPdfUrl(null)}>Close</CloseButton>
            <iframe
              src={pdfUrl}
              style={{ width: '100%', height: '80vh', border: 'none' }}
              title="PDF Viewer"
            />
          </ViewerContent>
        </ViewerContainer>
      )}
    </AppContainer>
  );
}

export default App;
