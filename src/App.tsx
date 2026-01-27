import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ProjectPage } from './pages/ProjectPage'
import { BlogPage } from './pages/BlogPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects/:slug" element={<ProjectPage />} />
      <Route path="/blogs/:slug" element={<BlogPage />} />
    </Routes>
  )
}

export default App
