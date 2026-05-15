import { NavLink } from 'react-router-dom';

const links = [
    { to: '/dashboard/students', label: 'Students' },
    { to: '/dashboard/add-students', label: 'Add Student' },
    { to: '/dashboard/classes', label: 'Classes' },
    { to: '/dashboard/add-classes', label: 'Add Class' },
    { to: '/dashboard/print-certificates', label: 'Print Certificates' },
];

const activeStyle = { fontWeight: 'bold', background: '#e0e0e0', borderRadius: 4 };

export default function Sidebar() {
    return (
        <nav style={{ width: 220, padding: '1rem', borderRight: '1px solid #ddd' }}>
            <h2>Dashboard</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {links.map(({ to, label }) => (
                    <li key={to} style={{ marginBottom: 4 }}>
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
                <li style={{ marginTop: 'auto' }}>
                    <button onClick={() => alert('Logout')}>Logout</button>
                </li>
            </ul>
        </nav>
    );
}