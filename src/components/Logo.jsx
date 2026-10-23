import { Link } from 'react-router-dom'
import logo from '../assets/ElVolcan.png'
import './Logo.css'

export default function Logo() {
  return (
    <Link to="/" className="logo-container">
      <img src={logo} alt="Logo Distribuidora de Gas" className="logo-img" />
    </Link>
  )
}
