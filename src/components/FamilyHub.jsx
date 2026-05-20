import { useState, useEffect } from 'react';
import { Users, Plus, Cake, Trash2, LayoutGrid, Network } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import FamilyTreeAnimation from './FamilyTreeAnimation';

export default function FamilyHub() {
  const { familyMembers, addFamilyMember, removeFamilyMember, getUpcomingBirthdays } = useFamily();
  const upcomingBirthdays = getUpcomingBirthdays();

  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [newMember, setNewMember] = useState({ name: '', relation: '', birthday: '', photo: null });

  useEffect(() => {
    if (upcomingBirthdays.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
      const names = upcomingBirthdays.map(m => m.name).join(', ');
      new Notification('Upcoming Birthdays!', {
        body: `${names} ${upcomingBirthdays.length > 1 ? 'have birthdays' : 'has a birthday'} coming up soon!`,
        icon: 'https://cdn-icons-png.flaticon.com/512/3159/3159614.png' // Cake icon placeholder
      });
    }
  }, [upcomingBirthdays.length]);

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewMember(prev => ({ ...prev, photo: URL.createObjectURL(e.target.files[0]) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMember.name && newMember.relation) {
      addFamilyMember(newMember);
      setNewMember({ name: '', relation: '', birthday: '', photo: null });
      setShowAddForm(false);
    }
  };

  return (
    <div className="main-content" style={{ height: '100vh', paddingBottom: 0 }}>
      <header className="header">
        <h1 className="page-title">Family Hub</h1>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="toggle-group" style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              style={{ padding: '8px', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
              onClick={() => setViewMode('tree')}
              style={{ padding: '8px', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <Network size={18} />
            </button>
          </div>

          <button className="upload-btn" onClick={() => setShowAddForm(true)}>
            <Plus size={18} />
            Add Member
          </button>
        </div>
      </header>

      {upcomingBirthdays.length > 0 && (
        <div className="birthday-banner">
          <Cake size={24} />
          <div>
            <strong>Upcoming Birthdays!</strong>
            <p>
              {upcomingBirthdays.map(m => m.name).join(', ')} 
              {upcomingBirthdays.length > 1 ? ' have birthdays ' : ' has a birthday '} 
              coming up soon!
            </p>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="lightbox-overlay" style={{ alignItems: 'center' }}>
          <form className="modal-content glass-panel" onSubmit={handleSubmit}>
            <h2>Add Family Member</h2>
            <div className="form-group">
              <label>Photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input required type="text" className="text-input" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Relation (e.g., Mom, Dad)</label>
              <input required type="text" className="text-input" value={newMember.relation} onChange={e => setNewMember({...newMember, relation: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Birthday</label>
              <input type="date" className="text-input" value={newMember.birthday} onChange={e => setNewMember({...newMember, birthday: e.target.value})} />
            </div>
            <div className="modal-actions">
              <button type="button" className="text-input" style={{width:'auto'}} onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="upload-btn">Save Member</button>
            </div>
          </form>
        </div>
      )}

      {familyMembers.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid-view">
            {familyMembers.map(member => (
              <div key={member.id} className="family-card glass-panel">
                <div className="family-photo">
                  {member.photo ? <img src={member.photo} alt={member.name} /> : <Users size={40} className="text-secondary" />}
                </div>
                <h3>{member.name}</h3>
                <p className="relation">{member.relation}</p>
                {member.birthday && (
                  <p className="birthday">
                    <Cake size={14} /> 
                    {new Date(member.birthday).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                )}
                <button className="icon-btn delete-btn" onClick={() => removeFamilyMember(member.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <FamilyTreeAnimation familyMembers={familyMembers} removeFamilyMember={removeFamilyMember} />
        )
      ) : (
        <div className="empty-state">
          <Users className="empty-icon" />
          <h2 className="empty-title">No Family Members</h2>
          <p>Click "Add Member" to start building your family hub.</p>
        </div>
      )}
    </div>
  );
}
