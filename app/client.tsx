import { StartClient } from '@tanstack/start'
import { createRouter } from './router'
import './global.css'

const router = createRouter()

export default function App() {
  return <StartClient router={router} />
}
