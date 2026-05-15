import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Dashboard from "./Pages/Dashboard";
import Students from "./Components/Students";
import AddStudent from "./Components/AddStudent";
import AddClass from "./Components/AddClass";
import Classes from "./Components/Classes";
import PrintCertificatesComponent from "./Components/PrintCertificatesComponent";

export default function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />}>
                        <Route index element={<Navigate to="students" replace />} />
                        <Route path="students" element={<Students />} />
                        <Route path="add-students" element={<AddStudent />} />
                        <Route path="classes" element={<Classes />} />
                        <Route path="add-classes" element={<AddClass />} />
                        <Route path="print-certificates" element={<PrintCertificatesComponent />} />
                    </Route>
                </Routes>
            </BrowserRouter>
            {/* <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />}>
                        <Route index element={<Navigate to="/students" replace />} />
                        <Route path="students" element={<Students />} />
                        <Route path="classes" element={<Classes />} />
                        <Route path="print-certificates" element={<PrintCertificatesComponent />} />
                    </Route>
                </Routes>
            </BrowserRouter> */}
        </>
    );
}