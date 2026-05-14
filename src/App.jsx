import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LeavingCertificate from "./Certificates/LeavingCertificate";
import ProvisionalCertificate from "./Certificates/ProvisionalCertificate";
import CharacterCertificate from "./Certificates/CharacterCertificate";

import { useEffect, useRef, useState } from "react";

import { useReactToPrint } from "react-to-print";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Students from "./Components/Students";
import Classes from "./Components/Classes";
import PrintCertificatesComponent from "./Components/PrintCertificatesComponent";

export default function App() {
    //   const [student, setStudent] = useState(null);

    // IMPORTANT: ref starts as null but will attach later
    //   const printRef = useRef(null);

    //   useEffect(() => {
    //     api
    //       .get("/api/v1/students/6a0583e2a7e2da14dce98b7b")
    //       .then((res) => setStudent(res.data.data.data));
    //   }, []);

    // ✅ NEW CORRECT API (react-to-print v3+)
    //   const handlePrint = useReactToPrint({
    //     contentRef: printRef,
    //     documentTitle: "Student Certificates",
    //   });

    //   if (!student) return <h2>Loading...</h2>;

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Dashboard />}>
                        <Route index element={<Navigate to="/students" replace />} />
                        <Route path="students" element={<Students />} />
                        <Route path="classes" element={<Classes />} />
                        <Route path="print-certificates" element={<PrintCertificatesComponent />} />
                    </Route>
                </Routes>
            </BrowserRouter>

        </>
        // <div style={{ padding: 20 }}>
        //   <h1>Certificate System</h1>

        //   <h2>
        //     {student.firstName} {student.lastName}
        //   </h2>

        //   <button onClick={handlePrint}>Print All Certificates</button>

        //   <div ref={printRef}>
        //     <LeavingCertificate student={student} />
        //     <ProvisionalCertificate student={student} />
        //     <CharacterCertificate student={student} />
        //   </div>
        // </div>
    );
}