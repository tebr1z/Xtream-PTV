import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StreamHub from './components/StreamHub'
import XtremeCodeLogin from './components/XtremeCodeLogin'
import M3ULogin from './components/M3ULogin'
import Auth from './components/Auth'
import ChannelList from './components/ChannelList'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StreamHub />} />
        <Route path="/xtreme-code" element={<XtremeCodeLogin />} />
        <Route path="/m3u-playlist" element={<M3ULogin />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/channels" element={<ChannelList />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
