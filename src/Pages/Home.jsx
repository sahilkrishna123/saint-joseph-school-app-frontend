import { NavLink } from "react-router-dom";

export default function Home() {
    return (
        <>
            <h1>Home page</h1>
            <br />
            <NavLink
                to="/login"
                style={({ isActive }) => ({
                    color: isActive ? "green" : "blue",
                })}
            >
                Login
            </NavLink>
        </>
    );
}