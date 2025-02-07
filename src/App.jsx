import {  useState } from  "react";
import LoginPage from "./pages/loginPage";
import ProductPage from "./pages/ProductPage";

function App() {
  const [isAuth, setAuth] = useState(false);

  return (
    <>
      { isAuth ?  <ProductPage /> : <LoginPage setAuth={setAuth}/> }
    </>
  )
}

export default App
