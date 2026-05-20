import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

export default function LockScreen() {
  const { unlock } = useAuth();
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeypadClick = (num) => {
    if (enteredPin.length < 4) {
      setEnteredPin(prev => prev + num);
      setError(false);
    }
  };

  const handleClear = () => {
    setEnteredPin('');
    setError(false);
  };

  const handleSubmit = () => {
    if (enteredPin.length > 0) {
      const success = unlock(enteredPin);
      if (!success) {
        setError(true);
        setEnteredPin('');
      }
    }
  };

  return (
    <div className="lightbox-overlay" style={{ display: 'flex', flexDirection: 'column', zIndex: 99999, background: 'var(--bg-color)' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Lock size={48} style={{ color: 'var(--accent-color)', marginBottom: '16px' }} />
        <h2>Enter PIN</h2>
        {error && <p style={{ color: 'var(--danger)', marginTop: '8px' }}>Incorrect PIN. Try again.</p>}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', height: '24px' }}>
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            style={{ 
              width: '16px', 
              height: '16px', 
              borderRadius: '50%', 
              background: i < enteredPin.length ? 'var(--text-primary)' : 'var(--panel-border)' 
            }} 
          />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '300px', width: '100%' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num} 
            onClick={() => handleKeypadClick(num.toString())}
            style={{
              padding: '20px',
              fontSize: '24px',
              background: 'var(--panel-bg)',
              border: '1px solid var(--panel-border)',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            {num}
          </button>
        ))}
        <button 
          onClick={handleClear}
          style={{
            padding: '20px',
            fontSize: '18px',
            color: 'var(--text-secondary)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
        <button 
          onClick={() => handleKeypadClick('0')}
          style={{
            padding: '20px',
            fontSize: '24px',
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          0
        </button>
        <button 
          onClick={handleSubmit}
          style={{
            padding: '20px',
            fontSize: '18px',
            color: 'var(--accent-color)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Enter
        </button>
      </div>
    </div>
  );
}
