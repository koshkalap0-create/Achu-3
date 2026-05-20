/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { initialFamilyMembers } from '../data/familyData';

const FamilyContext = createContext();

export const useFamily = () => useContext(FamilyContext);

export const FamilyProvider = ({ children }) => {
  const [familyMembers, setFamilyMembers] = useState(() => {
    const saved = localStorage.getItem('familyMembers');
    const savedMembers = saved ? JSON.parse(saved) : [];
    
    // If there are saved members, we use them.
    // If there are none, we load from our familyData.js file!
    return savedMembers.length > 0 ? savedMembers : initialFamilyMembers;
  });

  useEffect(() => {
    localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
  }, [familyMembers]);

  const addFamilyMember = (member) => {
    setFamilyMembers(prev => [...prev, { ...member, id: crypto.randomUUID() }]);
  };

  const removeFamilyMember = (id) => {
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();

    return familyMembers.filter(member => {
      if (!member.birthday) return false;
      const bDate = new Date(member.birthday);
      const bMonth = bDate.getMonth();
      const bDay = bDate.getDate();

      // Check if birthday is today or within the next 7 days
      // Simplistic approach for current year
      const currentYearBday = new Date(today.getFullYear(), bMonth, bDay);
      const diffTime = currentYearBday - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays >= 0 && diffDays <= 7;
    });
  };

  const value = {
    familyMembers,
    addFamilyMember,
    removeFamilyMember,
    getUpcomingBirthdays
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
};
