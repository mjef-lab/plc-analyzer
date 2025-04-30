import React from 'react';
import styled from 'styled-components';

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
}

const parsePLCCode = (code: string): Rung[] => {
  const rungs: Rung[] = [];
  let currentRung: Contact[] = [];
  let rungNumber = 0;

  const lines = code.split('\n');
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('Network')) {
      if (currentRung.length > 0) {
        rungs.push({ contacts: currentRung, number: rungNumber });
      }
      currentRung = [];
      rungNumber++;
    } else if (trimmedLine.startsWith('LD')) {
      const contact = trimmedLine.split(' ')[1];
      currentRung.push({
        type: trimmedLine.includes('LDN') ? 'NC' : 'NO',
        name: contact,
        x: currentRung.length,
        y: 0
      });
    } else if (trimmedLine.startsWith('AND')) {
      const contact = trimmedLine.split(' ')[1];
      currentRung.push({
        type: trimmedLine.includes('ANDN') ? 'NC' : 'NO',
        name: contact,
        x: currentRung.length,
        y: 0
      });
    } else if (trimmedLine.startsWith('TON')) {
      const [_, timer, time] = trimmedLine.split(' ');
      currentRung.push({
        type: 'Timer',
        name: timer,
        value: time,
        x: currentRung.length,
        y: 0
      });
    } else if (trimmedLine.startsWith('CTU')) {
      const [_, counter, preset] = trimmedLine.split(' ');
      currentRung.push({
        type: 'Counter',
        name: counter,
        value: preset,
        x: currentRung.length,
        y: 0
      });
    } else if (trimmedLine.startsWith('CMP')) {
      const [_, value1, op, value2] = trimmedLine.split(' ');
      currentRung.push({
        type: 'Compare',
        name: `${value1} ${op} ${value2}`,
        x: currentRung.length,
        y: 0
      });
    } else if (trimmedLine.startsWith('SET')) {
      const coil = trimmedLine.split(' ')[1];
      currentRung.push({
        type: 'Set',
        name: coil,
        x: currentRung.length,
        y: 0
      });
    } else if (trimmedLine.startsWith('RST')) {
      const coil = trimmedLine.split(' ')[1];
      currentRung.push({
        type: 'Reset',
        name: coil,
        x: currentRung.length,
        y: 0
      });
    } else if (trimmedLine.startsWith('ST')) {
      const coil = trimmedLine.split(' ')[1];
      currentRung.push({
        type: 'Coil',
        name: coil,
        x: currentRung.length,
        y: 0
      });
    }
  });

  if (currentRung.length > 0) {
    rungs.push({ contacts: currentRung, number: rungNumber });
  }

  return rungs;
};

const LadderDiagram: React.FC<LadderDiagramProps> = ({ code }) => {
  const rungs = parsePLCCode(code);

  return (
    <DiagramContainer>
      <RungContainer>
        {rungs.map((rung, index) => (
          <Rung key={index}>
            <RungNumber>{index + 1}</RungNumber>
            {rung.contacts.map((contact, contactIndex) => (
              <Contact key={contactIndex} type={contact.type}>
                {contact.name}
                {contact.value && <Value>{contact.value}</Value>}
              </Contact>
            ))}
          </Rung>
        ))}
      </RungContainer>
    </DiagramContainer>
  );
};

export default LadderDiagram; 