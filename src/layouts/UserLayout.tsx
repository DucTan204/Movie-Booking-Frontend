import { Outlet } from 'react-router-dom';
import UserNavbar from '../components/user/UserNavbar';
import UserFooter from '../components/user/UserFooter';
import './UserLayout.css';

export default function UserLayout() {
  return (
    <div className="user-layout">
      <UserNavbar />
      <main className="user-layout-main">
        <Outlet />
      </main>
      <UserFooter />
    </div>
  );
}