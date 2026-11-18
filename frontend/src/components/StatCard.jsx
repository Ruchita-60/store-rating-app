import React from 'react';

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-100',
    glow: 'shadow-indigo-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    glow: 'shadow-emerald-100',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
    glow: 'shadow-amber-100',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-100',
    glow: 'shadow-purple-100',
  },
};

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle, extra }) => {
  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h4 className="text-2xl font-bold text-slate-800 mt-1.5">{value}</h4>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-2xl ${scheme.bg} ${scheme.text} shadow-xs ${scheme.glow}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {extra && <div className="mt-4 pt-3 border-t border-slate-100">{extra}</div>}
    </div>
  );
};

export default StatCard;
