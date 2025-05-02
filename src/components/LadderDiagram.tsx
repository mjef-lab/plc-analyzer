import React from 'react';
import styled from 'styled-components';
import { SymbolData } from './MitsubishiSymbolHandler';

interface Contact {
  type: 'NO' | 'NC' | 'Coil' | 'Timer' | 'Counter' | 'Compare' | 'Set' | 'Reset';
  name: string;
  x: number;
  y: number;
  value?: string;
}

interface Rung {
  contacts: Contact[];
  number: number;
}

const DiagramContainer = styled.div`
  background-color: #2a2a2a;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #FFD700;
  overflow: auto;
`;

const RungContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Rung = styled.div`
  display: flex;
  align-items: center;
  min-height: 80px;
  position: relative;
  border-left: 2px solid #FFD700;
  border-right: 2px solid #FFD700;
  padding: 0 1rem;
`;

const RungNumber = styled.div`
  position: absolute;
  left: -30px;
  color: #FFD700;
  font-size: 0.8rem;
`;

const Contact = styled.div<{ type: string }>`
  width: 60px;
  height: 40px;
  border: 2px solid #FFD700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 1rem;
  position: relative;
  background-color: #1a1a1a;
  color: #ffffff;
  font-size: 0.8rem;
  text-align: center;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    left: -1rem;
    right: -1rem;
    height: 2px;
    background-color: #FFD700;
  }

  ${props => props.type === 'NC' && `
    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      background-color: #FF4136;
      transform: rotate(-45deg);
    }
  `}

  ${props => props.type === 'Coil' && `
    border-radius: 20px;
    &::before {
      left: -0.5rem;
    }
    &::after {
      content: '';
      position: absolute;
      right: -0.5rem;
      width: 0.5rem;
      height: 2px;
      background-color: #FFD700;
    }
  `}

  ${props => props.type === 'Timer' && `
    width: 80px;
    height: 60px;
    &::before {
      top: 50%;
    }
    &::after {
      content: 'TMR';
      position: absolute;
      top: 5px;
      font-size: 0.7rem;
      color: #FFD700;
    }
  `}

  ${props => props.type === 'Counter' && `
    width: 80px;
    height: 60px;
    &::before {
      top: 50%;
    }
    &::after {
      content: 'CTR';
      position: absolute;
      top: 5px;
      font-size: 0.7rem;
      color: #FFD700;
    }
  `}

  ${props => props.type === 'Compare' && `
    width: 80px;
    &::after {
      content: 'CMP';
      position: absolute;
      top: -20px;
      font-size: 0.7rem;
      color: #FFD700;
    }
  `}

  ${props => props.type === 'Set' && `
    &::after {
      content: 'S';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: -15px;
      font-size: 0.8rem;
      color: #FFD700;
    }
  `}

  ${props => props.type === 'Reset' && `
    &::after {
      content: 'R';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: -15px;
      font-size: 0.8rem;
      color: #FFD700;
    }
  `}
`;

const Value = styled.span`
  font-size: 0.7rem;
  color: #FFD700;
  margin-top: 4px;
`;

interface LadderDiagramProps {
  code: string;
  symbols: SymbolData[];
}

const SymbolLabel = styled.div`
  font-size: 0.8rem;
  color: #FFD700;
  text-align: center;
  margin-top: 0.25rem;
`;

const CommentLabel = styled.div`
  font-size: 0.7rem;
  color: #999;
  text-align: center;
  margin-top: 0.25rem;
  font-style: italic;
`;

const LadderDiagram: React.FC<LadderDiagramProps> = ({ code, symbols }) => {
  const findSymbol = (name: string): SymbolData | undefined => {
    return symbols.find(s => s.name === name || s.address === name);
  };

  const renderSymbolInfo = (name: string) => {
    const symbol = findSymbol(name);
    if (!symbol) return name;

    return (
      <>
        <div>{symbol.name}</div>
        <SymbolLabel>{symbol.address}</SymbolLabel>
        {symbol.comment && <CommentLabel>{symbol.comment}</CommentLabel>}
      </>
    );
  };

  const parsePLCCode = (code: string) => {
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

  const rungs = parsePLCCode(code);

  return (
    <div>
      {rungs.map((rung, rungIndex) => (
        <div key={rungIndex} style={{ marginBottom: '2rem' }}>
          <div style={{ borderBottom: '1px solid #FFD700', marginBottom: '0.5rem' }}>
            Network {rungIndex + 1}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {rung.contacts.map((contact, contactIndex) => {
              switch (contact.type) {
                case 'NO':
                  return (
                    <div key={contactIndex} style={{ textAlign: 'center' }}>
                      <div style={{ border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '4px' }}>
                        {renderSymbolInfo(contact.name)}
                      </div>
                    </div>
                  );
                case 'NC':
                  return (
                    <div key={contactIndex} style={{ textAlign: 'center' }}>
                      <div style={{ 
                        border: '1px solid #FFD700', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        position: 'relative' 
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderTop: '1px solid #FFD700',
                          transform: 'rotate(-45deg)',
                          transformOrigin: 'center'
                        }} />
                        {renderSymbolInfo(contact.name)}
                      </div>
                    </div>
                  );
                case 'Timer':
                  return (
                    <div key={contactIndex} style={{ textAlign: 'center' }}>
                      <div style={{ 
                        border: '1px solid #FFD700', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        minWidth: '100px' 
                      }}>
                        <div>TMR</div>
                        {renderSymbolInfo(contact.name)}
                        <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          {contact.value}
                        </div>
                      </div>
                    </div>
                  );
                case 'Coil':
                  return (
                    <div key={contactIndex} style={{ textAlign: 'center' }}>
                      <div style={{ 
                        border: '1px solid #FFD700', 
                        padding: '0.5rem', 
                        borderRadius: '20px'
                      }}>
                        {renderSymbolInfo(contact.name)}
                      </div>
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LadderDiagram; 