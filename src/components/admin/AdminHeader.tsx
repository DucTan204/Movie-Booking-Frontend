import './AdminHeader.css';

interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function AdminHeader({ title, subtitle, action }: Props) {
  return (
    <div className="admin-header">
      <div className="admin-header-text">
        <h1 className="admin-header-title">{title}</h1>
        {subtitle && <p className="admin-header-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="admin-header-action">{action}</div>}
    </div>
  );
}