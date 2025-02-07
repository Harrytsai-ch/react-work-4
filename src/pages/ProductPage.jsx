
import { useEffect, useRef, useState  } from  "react";
import axios from 'axios';
import ProductModal from "../components/ProductModal";
import DeleteProductModal from "../components/DeleteProductModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;
function ProductPage(){
    const [products, setProducts] = useState([]);
    const [pageInfo, setPageInfo] = useState(1);
    const [isWaiting, setIsWaiting] = useState(false);
    const [modalMode, setModalMode ]  = useState(null);
    const [isProductModalOpen,setIsProductModalOpen] = useState(false);
    const [isDeleteProductModalOpen,setIsDeleteProductModalOpen] = useState(false);
    const deleteProductID = useRef('');
    const defaultModalState = {
        imageUrl: "",
        title: "",
        category: "",
        unit: "",
        origin_price: "",
        price: "",
        description: "",
        content: "",
        is_enabled: 0,
        imagesUrl: [""]
    }

    const [tempProduct, setTempProduct] = useState(defaultModalState);

    useEffect(()=>{
        // getProductList 能夠讓 products 和 pageInfo 帶有初始值
        //初始取得產品列表，只會在元件第一次渲染 (mount) 時執行一次
        getProductList();
    },[]);

    const getProductList = async (page = 1)=> {
        try {
            const res = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/admin/products?page=${page}`);
            setProducts(res.data.products);
            setPageInfo(res.data.pagination);
        } catch (error) {
            console.log(error)
        }
    }

    const checkLogIn = async ()=> {
        try {
            setIsWaiting(true);
            await axios.post(`${BASE_URL}/v2/api/user/check`);
            setIsWaiting(false);
            alert('已登入');  
        } catch (error) {
            alert(error);
            }
    }
    
    const openProductModal = (mode, product)=> {
        //編輯模式或創建模式
        setModalMode(mode === 'create' ? 'create': 'edit');
        //開啟modal前必須要載入必要資料，創建用defaultModalState（所以全部的input就能為空值）,編輯用product
        setTempProduct(product);
        setIsProductModalOpen(true);
    }

    const openDeleteProductModal = (id)=> {
        setIsDeleteProductModalOpen(true);
        deleteProductID.current = id;
    }

    return (
        <>
            <div className="container py-5">
                <div className="row">
                <div className="col">
                    <div className="d-flex justify-content-between">
                    <h2>產品列表</h2>
                    <div className="d-flex gap-3">
                        <button type="button" disabled={isWaiting} onClick={checkLogIn} className="btn btn-danger">驗證登入</button>
                        <button type="button" className="btn btn-primary" onClick={()=>{ openProductModal('create', defaultModalState) }}>建立新的產品</button>
                    </div>
                    </div>
                    <table className="table">
                    <thead>
                        <tr>
                        <th scope="col">產品名稱</th>
                        <th scope="col">原價</th>
                        <th scope="col">售價</th>
                        <th scope="col">是否啟用</th>
                        <th scope="col">查看細節</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                        <tr key={product.id}>
                            <th scope="row">{product.title}</th>
                            <td>{product.origin_price}</td>
                            <td>{product.price}</td>
                            <td><p className={`${product.is_enabled===1 ? "text-success" : "text-danger"}`}>{product.is_enabled===1 ? '啟用': '停用'}</p></td>
                            <td>
                            <div className="btn-group d-flex gap-2">
                                <button type="button" className="btn btn-outline-primary" onClick={()=>{ openProductModal('edit', product) }}>編輯</button>
                                <button type="button" className="btn btn-outline-danger" disabled={isWaiting} onClick={()=>openDeleteProductModal(product.id)}>刪除</button>
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                    <div className="d-flex justify-content-center">
                    <nav>
                        <ul className="pagination">
                        <li className="page-item">
                            <button className={`page-link btn ${!pageInfo.has_pre && "disabled"}`}  value={(Number(pageInfo.current_page)|| 1) - 1 } onClick={(e)=>{getProductList(e.target.value)}}>
                            上一頁
                            </button>
                        </li>
                        {
                            [...Array(pageInfo.total_pages).keys()].map((item)=>{
                            return (
                            <li className="page-item" key={item + 1}>
                                <button className={`page-link ${item + 1 === pageInfo.current_page && "active"}`} value={item + 1} onClick={(e)=>{getProductList(e.target.value)}}>
                                {item + 1}
                                </button>
                            </li>
                            )
                            })
                        }
                        <li className="page-item">
                            <button className={`page-link btn ${!pageInfo.has_next && "disabled"}`} value={ (Number(pageInfo.current_page)|| 1) + 1 }  onClick={(e)=>{getProductList(e.target.value)}} >
                            下一頁
                            </button>
                        </li>
                        </ul>
                    </nav>
                    </div>
                </div>
                </div>
            </div>

            {isProductModalOpen && 
            <ProductModal 
            setIsProductModalOpen={setIsProductModalOpen} 
            getProductList={getProductList}  
            modalMode={modalMode} 
            tempProduct={tempProduct} 
            setTempProduct={setTempProduct}/> }

            {isDeleteProductModalOpen && 
            <DeleteProductModal 
            setIsDeleteProductModalOpen={setIsDeleteProductModalOpen}
            getProductList={getProductList} 
            id={deleteProductID.current} 
            setIsWaiting={setIsWaiting}/>}
        </>
    )
}

export default ProductPage;