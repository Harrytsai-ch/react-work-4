import {  useState } from  "react";
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;
function LoginPage({setAuth}){
    const [account, setAccount] = useState({
        //這裡放預設值
        username: "",
        password: ""
      });

      const inputAccount = (e)=>{
        //當前 input 的 name 及 value 用set方法寫入
        const {name, value} = e.target;
        //把帳號密碼等資料，從畫面用set方法寫入資料
        setAccount({
          ...account,
          [name]:value
        });
      }


      const handleLogIn = async (e)=>{
        e.preventDefault();
        try {
          // 本區塊表示成功登入(戳)六角 ＡＰＩ
            const res = await axios.post(`${BASE_URL}/v2/admin/signin`,account);
            const {token, expired} = res.data;
            // 存入cookie
            document.cookie = `hexApiToken=${token}; expires=${new Date(expired)}`;
            //登入成功之後
            setAuth(true);
            // 存入token
            axios.defaults.headers.common['Authorization'] = token;
          } catch (error) {
            alert(error); 
          }
      }

    return ( <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <h1 className="mb-5">請先登入</h1>
        {/* 監聽在表單 */}
        <form onSubmit={handleLogIn} className="d-flex flex-column gap-3">
          <div className="form-floating mb-3">
            <input name="username" value={account.username} onChange={inputAccount} type="email" className="form-control" id="username" placeholder="name@example.com" />
            <label htmlFor="username">Email address</label>
          </div>
          <div className="form-floating">
            <input name="password" value={account.password} onChange={inputAccount} type="password" className="form-control" id="password" placeholder="Password" />
            <label htmlFor="password">Password</label>
          </div>
          <button className="btn btn-primary">登入</button>
        </form>
        <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
      </div> );
}

export default LoginPage