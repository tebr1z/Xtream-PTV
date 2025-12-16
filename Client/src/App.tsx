import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StreamHub from './components/StreamHub'
import XtremeCodeLogin from './components/XtremeCodeLogin'
import SavedXtremeCodeAccounts from './components/SavedXtremeCodeAccounts'
import M3ULogin from './components/M3ULogin'
import SavedM3UAccounts from './components/SavedM3UAccounts'
import Auth from './components/Auth'
import ChannelList from './components/ChannelList'
import VideoPlayer from './components/VideoPlayer'
import AdminPanel from './components/AdminPanel'
import UserPanel from './components/UserPanel'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StreamHub />} />
        <Route path="/xtreme-code" element={<XtremeCodeLogin />} />
        <Route path="/xtreme-code-list" element={<SavedXtremeCodeAccounts />} />
        <Route path="/m3u-playlist" element={<M3ULogin />} />
        <Route path="/m3u-list" element={<SavedM3UAccounts />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/channels" element={<ChannelList />} />
        <Route path="/player" element={<VideoPlayer />} />
        <Route path="/t4br1z" element={<AdminPanel />} />
        <Route path="/user" element={<UserPanel />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
