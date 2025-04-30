import React, { useState } from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';

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

function App() {
  const [code, setCode] = useState('// Enter your PLC program here...');
  const [analysis, setAnalysis] = useState<string[]>([]);

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const analyzePLC = () => {
    // Placeholder for PLC analysis logic
    setAnalysis(['No errors found', 'Program structure valid', 'All variables declared']);
  };

  return (
    <AppContainer>
      <Header>
        <Title>PLC Analyzer</Title>
        <Button onClick={analyzePLC}>Analyze Program</Button>
      </Header>
      <MainContent>
        <EditorContainer>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
            }}
          />
        </EditorContainer>
        <AnalysisPanel>
          <AnalysisHeader>Analysis Results</AnalysisHeader>
          {analysis.map((result, index) => (
            <p key={index}>{result}</p>
          ))}
        </AnalysisPanel>
      </MainContent>
    </AppContainer>
  );
}

export default App;
