// app/dashboard/DashboardCard.tsx
'use client';

interface DashboardCardProps {
  number: string | number;
  label: string;
  onDetailClick?: () => void;
}

export default function DashboardCard({ number, label, onDetailClick }: DashboardCardProps) {
  return (
    <div className="dashboard-card">
      <div className="card-number">{number}</div>
      <div className="card-label">{label}</div>
      <button className="card-button" onClick={onDetailClick}>
        Lihat Detail
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 16 16 12 12 8"></polyline>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}