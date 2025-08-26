import { useNavigate } from "react-router-dom"

export default function HomePage(){
    const navigate = useNavigate()
    return(
    <>
        HOMEPAGE
        <button onClick={() => navigate("/main")}>Get Started -&gt;</button>
    </>
    )
    
}