import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChatProvider } from './context/ChatContext';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import './styles/globals.css';
export default function App() {
    return (_jsx(ChatProvider, { children: _jsxs("div", { style: { display: 'flex', height: '100vh', overflow: 'hidden' }, children: [_jsx(Sidebar, {}), _jsx(ChatWindow, {})] }) }));
}
