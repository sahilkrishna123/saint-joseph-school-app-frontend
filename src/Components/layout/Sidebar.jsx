import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
    { to: '/dashboard/students', label: 'Students' },
    { to: '/dashboard/add-students', label: 'Add Student' },
    { to: '/dashboard/classes', label: 'Classes' },
    { to: '/dashboard/add-classes', label: 'Add Class' },
    { to: '/dashboard/print-certificates', label: 'Print Certificates' },
];

const activeStyle = { fontWeight: 'bold', background: '#93c5fd', borderRadius: 4 };

export default function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <nav style={{ width: 220, padding: '1rem', borderRight: '1px solid #ddd' }}>
            <h2 className='heading text-3xl text-center m-1 mb-5'>Dashboard</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {links.map(({ to, label }) => (
                    <li className='body-text text-lg' key={to} style={{ marginBottom: 4 }}>
                        <NavLink
                            to={to}
                            style={({ isActive }) => ({
                                display: 'block',
                                padding: '8px 10px',
                                textDecoration: 'none',
                                color: 'inherit',
                                ...(isActive ? activeStyle : {}),
                            })}
                        >
                            {label}
                        </NavLink>
                    </li>
                ))}
                <li
                    onClick={handleLogout}
                    className='p-1 mt-10 cursor-pointer bg-red-300 hover:bg-red-400 body-text text-lg rounded text-center'
                >
                    Logout
                </li>
            </ul>
        </nav>
    );
}