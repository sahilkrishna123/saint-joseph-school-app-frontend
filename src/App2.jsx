import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import CheckoutPage from './Pages/CheckoutPage'
import PaymentSuccess from './Pages/PaymentSuccess'
import Downloads from './Pages/Downloads'
import MyPurchases from './Pages/MyPurchases'
import Register from './Pages/Register'
import Approve from './Pages/Approve'
import AdminLogin from './Pages/AdminLogin'
import Payment from './Pages/Payment'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/checkout' element={<CheckoutPage />} />

                    <Route path="/payment-success" element={<PaymentSuccess />} />

                    <Route path="/downloads" element={<Downloads />} />

                    <Route path="/my-purchases" element={<MyPurchases />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/approve" element={<Approve />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/payment" element={<Payment />} />
                </Routes>
            </BrowserRouter>

        </>
    )
}

export default App
