import React from 'react';
import { 
  Coffee, Car, Home, Zap, ShoppingBag, Stethoscope, GraduationCap, 
  Briefcase, TrendingUp, Gift, MoreHorizontal, Utensils, Smartphone, 
  CreditCard, Plane, Music, Gamepad, Book, Wrench, Film, Wifi
} from 'lucide-react';

export const getCategoryIcon = (category: string) => {
  const normalized = category.toLowerCase();
  const size = 20;

  if (normalized.includes('food') || normalized.includes('dining') || normalized.includes('eat') || normalized.includes('snack') || normalized.includes('restaurant')) return <Utensils size={size} className="text-orange-500" />;
  if (normalized.includes('coffee') || normalized.includes('cafe') || normalized.includes('drink')) return <Coffee size={size} className="text-amber-700" />;
  if (normalized.includes('transport') || normalized.includes('fuel') || normalized.includes('grab') || normalized.includes('gojek') || normalized.includes('taxi') || normalized.includes('bus') || normalized.includes('train') || normalized.includes('uber')) return <Car size={size} className="text-blue-500" />;
  if (normalized.includes('hous') || normalized.includes('rent') || normalized.includes('mortgage') || normalized.includes('apartment')) return <Home size={size} className="text-indigo-500" />;
  if (normalized.includes('util') || normalized.includes('electric') || normalized.includes('water') || normalized.includes('bill') || normalized.includes('gas')) return <Zap size={size} className="text-yellow-500" />;
  if (normalized.includes('shop') || normalized.includes('cloth') || normalized.includes('buy') || normalized.includes('store') || normalized.includes('fashion')) return <ShoppingBag size={size} className="text-pink-500" />;
  if (normalized.includes('health') || normalized.includes('doctor') || normalized.includes('med') || normalized.includes('pharmacy') || normalized.includes('hospital')) return <Stethoscope size={size} className="text-red-500" />;
  if (normalized.includes('educat') || normalized.includes('course') || normalized.includes('school') || normalized.includes('class') || normalized.includes('book')) return <GraduationCap size={size} className="text-purple-500" />;
  if (normalized.includes('salary') || normalized.includes('wage') || normalized.includes('income') || normalized.includes('paycheck') || normalized.includes('bonus')) return <Briefcase size={size} className="text-emerald-500" />;
  if (normalized.includes('invest') || normalized.includes('stock') || normalized.includes('crypto') || normalized.includes('save') || normalized.includes('trading')) return <TrendingUp size={size} className="text-green-600" />;
  if (normalized.includes('gift') || normalized.includes('donation') || normalized.includes('charity')) return <Gift size={size} className="text-rose-400" />;
  if (normalized.includes('tech') || normalized.includes('phone') || normalized.includes('internet') || normalized.includes('data') || normalized.includes('mobile') || normalized.includes('software')) return <Smartphone size={size} className="text-slate-400" />;
  if (normalized.includes('debt') || normalized.includes('loan') || normalized.includes('credit') || normalized.includes('fee')) return <CreditCard size={size} className="text-red-600" />;
  if (normalized.includes('travel') || normalized.includes('vacation') || normalized.includes('trip') || normalized.includes('flight') || normalized.includes('hotel')) return <Plane size={size} className="text-sky-500" />;
  if (normalized.includes('entertain') || normalized.includes('movie') || normalized.includes('music') || normalized.includes('cinema') || normalized.includes('concert')) return <Film size={size} className="text-violet-500" />;
  if (normalized.includes('game') || normalized.includes('gaming') || normalized.includes('steam')) return <Gamepad size={size} className="text-purple-600" />;
  if (normalized.includes('wifi') || normalized.includes('internet')) return <Wifi size={size} className="text-cyan-500" />;
  if (normalized.includes('service') || normalized.includes('repair') || normalized.includes('maintain')) return <Wrench size={size} className="text-slate-500" />;
  
  return <MoreHorizontal size={size} className="text-slate-400" />;
};