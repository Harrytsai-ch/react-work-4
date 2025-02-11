import {  useState, useEffect } from  "react";
import LoginPage from "./pages/LoginPage";
import ProductPage from "./pages/ProductPage";
import axios from 'axios'; 
const BASE_URL = import.meta.env.VITE_BASE_URL;

function App() {
  const [isAuth, setAuth] = useState(false);
  
  useEffect(()=>{
    //如果曾經登入過，並取得token，則axios的header會帶入token 
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexApiToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1",
    );
    axios.defaults.headers.common['Authorization'] = token;
    checkLogIn();
  },[]);

  const checkLogIn = async ()=> {
    try {
        await axios.post(`${BASE_URL}/v2/api/user/check`);
        setAuth(true);
    } catch (error) {
        console.log("登入錯誤",error);
    }
  }
 
  return (
    <>
      { isAuth ?  <ProductPage  /> : <LoginPage setAuth={setAuth}/> }
    </>
  )
}

export default App
