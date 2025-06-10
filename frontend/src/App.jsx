
import Navbar from "./components/Navbar"
import URLForm from "./components/URLForm"
function App() {
  return (
    <>
      <div>
        <Navbar></Navbar>
        <div class="flex flex-col items-center justify-center min-h-screen bg-pink-100">

        <URLForm></URLForm>
        </div>
      </div>
    </>
  )
}

export default App
