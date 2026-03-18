import { ChatProvider } from './context/ChatContext'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import './styles/globals.css'

export default function App() {
  return (
    <ChatProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <ChatWindow />
      </div>
    </ChatProvider>
  )
}
