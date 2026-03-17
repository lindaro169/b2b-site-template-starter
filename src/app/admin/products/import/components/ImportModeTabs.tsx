'use client';

interface ImportModeTabsProps {
  currentMode: 'quick' | 'step';
  onModeChange: (mode: 'quick' | 'step') => void;
}

export default function ImportModeTabs({
  currentMode,
  onModeChange,
}: ImportModeTabsProps) {
  return (
    <div style={tabsContainerStyle}>
      <div style={tabsStyle}>
        <button
          style={{
            ...tabButtonStyle,
            ...(currentMode === 'quick' ? tabButtonActiveStyle : {}),
          }}
          onClick={() => onModeChange('quick')}
        >
          <span style={{ fontSize: '18px', marginRight: '8px' }}>⚡</span>
          快速导入（推荐）
        </button>
        <button
          style={{
            ...tabButtonStyle,
            ...(currentMode === 'step' ? tabButtonActiveStyle : {}),
          }}
          onClick={() => onModeChange('step')}
        >
          <span style={{ fontSize: '18px', marginRight: '8px' }}>📋</span>
          分步导入
        </button>
      </div>

      <div style={tabDescriptionStyle}>
        {currentMode === 'quick' ? (
          <p>
            💡 <strong>快速导入</strong>：将Excel和图片打包在ZIP中，一次上传完成。适合数据准确的情况。
          </p>
        ) : (
          <p>
            💡 <strong>分步导入</strong>：先上传Excel验证数据，再上传图片。适合需要验证的情况。
          </p>
        )}
      </div>
    </div>
  );
}

const tabsContainerStyle: React.CSSProperties = {
  marginBottom: '30px',
};

const tabsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  borderBottom: '1px solid #e0e6ed',
  marginBottom: '20px',
};

const tabButtonStyle: React.CSSProperties = {
  padding: '12px 20px',
  border: 'none',
  background: 'transparent',
  color: '#718096',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: '600',
  borderBottom: '3px solid transparent',
  borderBottomWidth: '3px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'transparent',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
};

const tabButtonActiveStyle: React.CSSProperties = {
  color: '#667eea',
  borderBottomColor: '#667eea',
};

const tabDescriptionStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: '#f0f4ff',
  borderRadius: '6px',
  color: '#4c51bf',
  fontSize: '14px',
  marginBottom: '20px',
};
