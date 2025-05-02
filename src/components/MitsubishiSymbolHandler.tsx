import React, { useState } from 'react';
import styled from 'styled-components';

interface SymbolData {
  name: string;
  address: string;
  dataType: string;
  comment: string;
  format: 'bit' | 'byte' | 'word' | 'double' | 'quad';
}

const Container = styled.div`
  background-color: #2a2a2a;
  border: 1px solid #FFD700;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  color: #FFD700;
  margin: 0 0 1rem 0;
`;

const SymbolTable = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-top: 1rem;
`;

const SymbolRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr 1fr;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid #444;
  
  &:hover {
    background-color: #333;
  }
`;

const SymbolHeader = styled(SymbolRow)`
  font-weight: bold;
  color: #FFD700;
  border-bottom: 2px solid #FFD700;
`;

const ImportButton = styled.button`
  background-color: #FFD700;
  color: #1a1a1a;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 1rem;

  &:hover {
    background-color: #FF4136;
    color: #ffffff;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const MitsubishiSymbolHandler: React.FC = () => {
  const [symbols, setSymbols] = useState<SymbolData[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const parseGXWorksFile = (content: string) => {
    const lines = content.split('\n');
    const parsedSymbols: SymbolData[] = [];

    lines.forEach(line => {
      // Handle different Mitsubishi file formats
      if (line.includes(',')) {  // CSV format
        const [name, address, dataType, comment] = line.split(',');
        if (name && address) {
          parsedSymbols.push({
            name: name.trim(),
            address: address.trim(),
            dataType: dataType?.trim() || 'Unknown',
            comment: comment?.trim() || '',
            format: determineFormat(dataType?.trim() || '')
          });
        }
      } else if (line.includes('\t')) {  // Tab-delimited format
        const [name, address, dataType, comment] = line.split('\t');
        if (name && address) {
          parsedSymbols.push({
            name: name.trim(),
            address: address.trim(),
            dataType: dataType?.trim() || 'Unknown',
            comment: comment?.trim() || '',
            format: determineFormat(dataType?.trim() || '')
          });
        }
      }
    });

    setSymbols(parsedSymbols);
  };

  const determineFormat = (dataType: string): 'bit' | 'byte' | 'word' | 'double' | 'quad' => {
    const type = dataType.toLowerCase();
    if (type.includes('bit') || type.includes('bool')) return 'bit';
    if (type.includes('byte')) return 'byte';
    if (type.includes('word') || type.includes('int16')) return 'word';
    if (type.includes('dword') || type.includes('int32')) return 'double';
    if (type.includes('lword') || type.includes('int64')) return 'quad';
    return 'word'; // default to word format
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        parseGXWorksFile(content);
      };
      reader.readAsText(file);
    }
  };

  const importFromDocument = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Container>
      <Title>Mitsubishi PLC Symbols</Title>
      <div>
        <ImportButton onClick={importFromDocument}>
          Import Symbols
        </ImportButton>
        <FileInput
          type="file"
          accept=".csv,.txt,.sym"
          onChange={handleFileUpload}
          ref={fileInputRef}
        />
      </div>
      {symbols.length > 0 && (
        <SymbolTable>
          <SymbolHeader>
            <div>Name</div>
            <div>Address</div>
            <div>Format</div>
            <div>Comment</div>
            <div>Data Type</div>
          </SymbolHeader>
          {symbols.map((symbol, index) => (
            <SymbolRow key={index}>
              <div>{symbol.name}</div>
              <div>{symbol.address}</div>
              <div>{symbol.format}</div>
              <div>{symbol.comment}</div>
              <div>{symbol.dataType}</div>
            </SymbolRow>
          ))}
        </SymbolTable>
      )}
    </Container>
  );
};

export default MitsubishiSymbolHandler; 