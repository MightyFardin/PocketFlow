import React from 'react';
import { 
  Coffee, Car, ShoppingBag, Film, BookOpen, 
  HeartPulse, FileText, Users, User, DollarSign,
  Briefcase, Gift, GraduationCap, Coins
} from 'lucide-react';

export const getCategoryIcon = (category, className = "w-4 h-4") => {
  switch (category) {
    case 'Food': return <Coffee className={className} />;
    case 'Transport': return <Car className={className} />;
    case 'Shopping': return <ShoppingBag className={className} />;
    case 'Entertainment': return <Film className={className} />;
    case 'Education': return <BookOpen className={className} />;
    case 'Health': return <HeartPulse className={className} />;
    case 'Bills': return <FileText className={className} />;
    case 'Family': return <Users className={className} />;
    case 'Personal': return <User className={className} />;
    case 'Salary': return <Briefcase className={className} />;
    case 'Gift': return <Gift className={className} />;
    case 'Scholarship': return <GraduationCap className={className} />;
    case 'Freelance': return <Coins className={className} />;
    default: return <DollarSign className={className} />;
  }
};

export const getCategoryColor = (category) => {
  switch (category) {
    case 'Food': return '#f59e0b'; // amber-500
    case 'Transport': return '#3b82f6'; // blue-500
    case 'Shopping': return '#ec4899'; // pink-500
    case 'Entertainment': return '#8b5cf6'; // violet-500
    case 'Education': return '#14b8a6'; // teal-500
    case 'Health': return '#ef4444'; // red-500
    case 'Bills': return '#64748b'; // slate-500
    case 'Family': return '#f97316'; // orange-500
    case 'Personal': return '#10b981'; // emerald-500
    case 'Salary': return '#10b981'; // emerald-500
    case 'Gift': return '#f59e0b'; // amber-500
    case 'Scholarship': return '#06b6d4'; // cyan-500
    case 'Freelance': return '#6366f1'; // indigo-500
    default: return '#94a3b8'; // slate-400
  }
};
