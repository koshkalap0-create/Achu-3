import { useState, useEffect } from 'react';
import { Users, Cake, Trash2 } from 'lucide-react';

export default function FamilyTreeAnimation({ familyMembers, removeFamilyMember }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const centerX = 300;
  const centerY = 300;
  const radius = 200;

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      {/* SVGs for connecting lines */}
      <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', zIndex: 1 }}>
        {familyMembers.map((member, i) => {
          const angle = (i / familyMembers.length) * 2 * Math.PI - Math.PI / 2;
          const x2 = centerX + radius * Math.cos(angle);
          const y2 = centerY + radius * Math.sin(angle);
          
          return (
            <line
              key={member.id}
              x1={centerX}
              y1={centerY}
              x2={x2}
              y2={y2}
              stroke="var(--accent-color)"
              strokeWidth="2"
              strokeDasharray={mounted ? "0" : "1000"}
              strokeDashoffset={mounted ? "0" : "1000"}
              style={{
                transition: `stroke-dashoffset 1s ease-in-out ${i * 0.2}s`,
                opacity: mounted ? 0.5 : 0
              }}
            />
          );
        })}
      </svg>

      {/* Central Hub Node */}
      <div 
        className="glass-panel"
        style={{
          position: 'absolute',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2,
          background: 'var(--accent-gradient)',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
        }}
      >
        <Users size={32} color="white" />
      </div>

      {/* Outer Nodes */}
      {familyMembers.map((member, i) => {
        const angle = (i / familyMembers.length) * 2 * Math.PI - Math.PI / 2;
        // Position relative to a 600x600 box centered on the div
        const left = 300 + radius * Math.cos(angle);
        const top = 300 + radius * Math.sin(angle);
        
        return (
          <div
            key={member.id}
            className="family-card glass-panel"
            style={{
              position: 'absolute',
              left: `calc(50% - 300px + ${left}px)`,
              top: `calc(50% - 300px + ${top}px)`,
              transform: 'translate(-50%, -50%)',
              margin: 0,
              width: '140px',
              padding: '12px',
              zIndex: 3,
              opacity: mounted ? 1 : 0,
              transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.2 + 0.5}s`,
            }}
          >
            <div className="family-photo" style={{ width: '48px', height: '48px', margin: '0 auto 8px' }}>
              {member.photo ? <img src={member.photo} alt={member.name} /> : <Users size={24} className="text-secondary" />}
            </div>
            <h3 style={{ fontSize: '14px', marginBottom: '2px' }}>{member.name}</h3>
            <p className="relation" style={{ fontSize: '12px' }}>{member.relation}</p>
            {member.birthday && (
              <p className="birthday" style={{ fontSize: '11px', marginTop: '4px' }}>
                <Cake size={10} /> 
                {new Date(member.birthday).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            )}
            <button 
              className="icon-btn delete-btn" 
              onClick={(e) => { e.stopPropagation(); removeFamilyMember(member.id); }}
              style={{ position: 'absolute', top: '4px', right: '4px', padding: '4px' }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
