// 아이콘 설치 없이 바로 작동하는 오목 코드 (예시)
import React, { useState } from 'react';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
      <h1 style={{ color: '#333' }}>큐트 게임 월드 - 오목</h1>
      <div style={{ width: '300px', height: '300px', backgroundColor: '#e3c16f', border: '2px solid #8b4513', display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)' }}>
        {/* 오목판 격자 생성 */}
        {Array.from({ length: 225 }).map((_, i) => (
          <div key={i} style={{ border: '0.5px solid rgba(0,0,0,0.2)' }}></div>
        ))}
      </div>
      <p style={{ marginTop: '20px' }}>오목판이 정상적으로 보인다면 성공입니다!</p>
    </div>
  );
}

export default App;