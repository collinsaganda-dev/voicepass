import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="test-page">
      <h1>Test Page</h1>
      <p>This is a test page for the VoicePass application.</p>
      <div className="test-content">
        <h2>Testing Features</h2>
        <ul>
          <li>Voice recognition functionality</li>
          <li>Session management</li>
          <li>Real-time updates</li>
        </ul>
      </div>
    </div>
  );
};

export { TestPage };
