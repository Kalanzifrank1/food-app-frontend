import { Loader } from "lucide-react"
import { Button } from "./ui/button"


const LoadingButton = () => {
  return (
    <Button disabled>
        <Loader className="mr-2 h-4 w-4 animate-spin"/>
        Loading
    </Button>
  )
}

export default LoadingButton
