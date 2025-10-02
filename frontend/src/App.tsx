import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
function App() {

  return (
    <>
      <div className=" flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <header className="App-header">
          <p className='font-semibold text-blue-500'>
            Hello World!
          </p>
        </header>
        <Button variant="ghost">
          <ChevronRight></ChevronRight>
          Click Me
        </Button>
      </div>
    </>
  )
}

export default App
