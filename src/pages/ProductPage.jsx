
import { useEffect, useRef, useState  } from  "react";
import {  Modal } from 'bootstrap';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;
function ProductPage(){
    const [products, setProducts] = useState([]);
    const [pageInfo, setPageInfo] = useState(1);
    const productModalRef = useRef(null);
    const productModalMethodRef = useRef(null);
    const deleteProductModalRef = useRef(null);
    const deleteProductModalMethodRef = useRef(null); 
    const [isWaiting, setIsWaiting] = useState(false);
    const [modalMode, setModalMode ]  = useState(null);

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

    useEffect(()=>{
        productModalMethodRef.current = new Modal(productModalRef.current, { backdrop:false });
        deleteProductModalMethodRef.current = new Modal(deleteProductModalRef.current, { backdrop:false });
    },[])

    const closeProductModal = ()=> {
        productModalMethodRef.current.hide();
    }

    const deleteProductID = useRef('');
    const openDeleteProductModal = (id)=> {
        deleteProductModalMethodRef.current.show();
        deleteProductID.current = id;
    }

    const closeDeleteProductModal = ()=> {
        deleteProductModalMethodRef.current.hide();
    }

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

    const inputProductModal = (e)=>{
        //當前input標籤的屬性存放下來
        const { name, value, type, checked } = e.target
        setTempProduct({
            ...tempProduct,
            [name]: type === "checkbox" ? checked : value
        })
        console.log(tempProduct);
    }

    const openProductModal = (mode, product)=> {
        //編輯模式或創建模式
        mode === 'create' ?  setModalMode('create') : setModalMode('edit');
        //開啟modal前必須要載入必要資料，創建用defaultModalState（所以全部的input就能為空值）,編輯用product
        setTempProduct(product);
        //打印前一個id
        // console.log(tempProduct.id);
        productModalMethodRef.current.show();
    }

    const updateSubImages = (e, index) =>{
        //使用者在input輸入的網址 或 ＡＰＩ取到的網址
        const { value } = e.target;
        //當前imagesUrl展開複製一份
        const newImages = [...tempProduct.imagesUrl];
        //使用者輸入變更的網址寫入
        newImages[index] = value;

        setTempProduct({
        ...tempProduct,
        imagesUrl: newImages
        })
    }


    const addSubImages = ()=>{
        let newImages = [];
        if(!tempProduct.imagesUrl){
        //點擊新增按鈕給定一個預設為空值的陣列
        newImages = ['']
        }else{
        //陣列增加一個元素
        newImages = [...tempProduct.imagesUrl, ''];
        }
        
        setTempProduct({
        ...tempProduct,
        imagesUrl: newImages
        })
    }

    const deleteSubImages = ()=>{
        const newImages = [...tempProduct.imagesUrl];
        newImages.pop();

        setTempProduct({
        ...tempProduct,
        imagesUrl: newImages
        })
    }

    const createProduct = async ()=>{
        try {
        await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/product`, {
            data:{
            ...tempProduct,
            origin_price : Number(tempProduct.origin_price),
            price : Number(tempProduct.price),
            is_enabled : tempProduct.is_enabled ? 1 : 0
            }
        });
        } catch (error) {
        alert(error, '新增產品失敗');
        }
    }

    const editProduct = async() => {
        try {
        await axios.put(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`, {
            data:{
            ...tempProduct,
            origin_price : Number(tempProduct.origin_price),
            price : Number(tempProduct.price),
            is_enabled : tempProduct.is_enabled ? 1 : 0
            }
        });

        } catch (error) {
        alert(error, '編輯產品失敗');
        }
    }

    const updateProduct = async(mode) => {
        try {
        setIsWaiting(true);
        //創建程序必須先處理完，才開始後續程序
        mode ==='create'? await createProduct() : await editProduct();
        //取的新的產品列表的資料，才關閉modal
        await getProductList();
        setIsWaiting(false);
        closeProductModal();
        } catch (error) {
        alert(error, '更新產品失敗');
        }
    }

    const deleteProduct = async(id) =>{
        try {
        setIsWaiting(true);
        await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${id}`);
        await getProductList();
        setIsWaiting(false);
        closeDeleteProductModal();
        } catch (error) {
        alert(error, '刪除產品失敗');
        }
    }

    const uploadImgFile = async(e)=>{
        //上傳資料有ＡＰＩ
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file to upload',file);
        console.log(formData);
        
        try {
        const res = await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/upload`,formData);
        //上傳ＡＰＩ後會回傳一個url
        const uploadImg = res.data.imageUrl;

        setTempProduct({
            ...tempProduct,
            imageUrl:uploadImg
        });
        } catch (error) {
        alert(error,'上傳失敗！')
        }

    }

   //以上是資料，以下是畫面
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
            
            <div ref={productModalRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header border-bottom">
                    <h5 className="modal-title fs-4">{ modalMode ==='create' ? '創建產品':'編輯產品' }</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={closeProductModal}></button>
                    </div>
        
                    <div className="modal-body p-4">
                    <div className="row g-4">
                        <div className="col-md-4">
                        <div className="mb-4">
                            <label htmlFor="primary-image" className="form-label">
                            主圖
                            </label>
                            <div className="input-group">
                            <div className="w-100">
                                <input
                                name="imageUrl"
                                type="text"
                                id="primary-image"
                                className="form-control mb-2"
                                placeholder="請輸入圖片連結"
                                value={tempProduct.imageUrl}
                                onChange={inputProductModal}
                                />
                            </div>
                            { modalMode === 'create' && 
                            (<div className="w-100">
                                <label htmlFor="fileInput" className="form-label"> 圖片上傳 </label>
                                <input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                id="fileInput"
                                className="form-control mb-2"
                                placeholder="請上傳檔案"
                                onChange={(e)=>uploadImgFile(e)}  
                                />
                            </div>)
                            }
                            </div>
                            <img
                            src={tempProduct.imageUrl}
                            alt={tempProduct.title}
                            className="img-fluid"
                            />
                        </div>
        
                        {/* 副圖 */}
                        <div className="border border-2 border-dashed rounded-3 p-3">
                            {/* 由數據驅動（陣列)，下面點擊新增按鈕後，陣列會多增加一個元素，所以圖片和input也會增加一組 */}
                            {tempProduct.imagesUrl?.map((image, index) => (
                            <div key={index} className="mb-2">
                                <label
                                htmlFor={`imagesUrl-${index + 1}`}
                                className="form-label"
                                >
                                副圖 {index + 1}
                                </label>
                                <input
                                id={`imagesUrl-${index + 1}`}
                                type="text"
                                placeholder={`圖片網址 ${index + 1}`}
                                className="form-control mb-2"
                                value={image}
                                onChange={ (e)=>{
                                    updateSubImages(e, index)
                                }}
                                />
                                {image && (
                                <img
                                    src={image}
                                    alt={`副圖 ${index + 1}`}
                                    className="img-fluid mb-2"
                                />
                                )}
                            </div>
                            ))}
        
                            <div className="btn-group w-100">
                            { ((!tempProduct.imagesUrl) || 
                            ((tempProduct.imagesUrl.length < 5 && tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1] !== '')))
                            && (<button onClick={()=>{addSubImages()}} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>)}
                            
                            { (tempProduct.imagesUrl && tempProduct.imagesUrl.length > 1) && 
                            (<button onClick={()=>{deleteSubImages()}} className="btn btn-outline-danger btn-sm w-100">取消圖片</button>)}
                            </div>
        
                        </div>
                        </div>
        
                        <div className="col-md-8">
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">
                            標題
                            </label>
                            <input
                            name="title"
                            id="title"
                            type="text"
                            className="form-control"
                            placeholder="請輸入標題"
                            value={tempProduct.title}
                            onChange={inputProductModal}
                            />
                        </div>
        
                        <div className="mb-3">
                            <label htmlFor="category" className="form-label">
                            分類
                            </label>
                            <input
                            name="category"
                            id="category"
                            type="text"
                            className="form-control"
                            placeholder="請輸入分類"
                            value={tempProduct.category}
                            onChange={inputProductModal}
                            />
                        </div>
        
                        <div className="mb-3">
                            <label htmlFor="unit" className="form-label">
                            單位
                            </label>
                            <input
                            name="unit"
                            id="unit"
                            type="text"
                            className="form-control"
                            placeholder="請輸入單位"
                            value={tempProduct.unit}
                            onChange={inputProductModal}
                            />
                        </div>
        
                        <div className="row g-3 mb-3">
                            <div className="col-6">
                            <label htmlFor="origin_price" className="form-label">
                                原價
                            </label>
                            <input
                                name="origin_price"
                                id="origin_price"
                                type="number"
                                className="form-control"
                                placeholder="請輸入原價"
                                value={tempProduct.origin_price}
                                onChange={inputProductModal}
                            />
                            </div>
                            <div className="col-6">
                            <label htmlFor="price" className="form-label">
                                售價
                            </label>
                            <input
                                name="price"
                                id="price"
                                type="number"
                                className="form-control"
                                placeholder="請輸入售價"
                                value={tempProduct.price}
                                onChange={inputProductModal}
                            />
                            </div>
                        </div>
        
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">
                            產品描述
                            </label>
                            <textarea
                            name="description"
                            id="description"
                            className="form-control"
                            rows={4}
                            placeholder="請輸入產品描述"
                            value={tempProduct.description}
                            onChange={inputProductModal}
                            ></textarea>
                        </div>
        
                        <div className="mb-3">
                            <label htmlFor="content" className="form-label">
                            說明內容
                            </label>
                            <textarea
                            name="content"
                            id="content"
                            className="form-control"
                            rows={4}
                            placeholder="請輸入說明內容"
                            value={tempProduct.content}
                            onChange={inputProductModal}
                            ></textarea>
                        </div>
        
                        <div className="form-check">
                            <input
                            name="is_enabled"
                            type="checkbox"
                            className="form-check-input"
                            id="isEnabled"
                            checked={tempProduct.is_enabled}
                            onChange={inputProductModal}
                            />
                            <label className="form-check-label" htmlFor="isEnabled">
                            是否啟用
                            </label>
                        </div>
                        </div>
                    </div>
                    </div>
        
                    <div className="modal-footer border-top bg-light">
                    <button type="button" className="btn btn-secondary" onClick={closeProductModal}>
                        取消
                    </button>
                    <button disabled={isWaiting} type="button" className="btn btn-primary" onClick={()=>{ modalMode==="create"? updateProduct("create") : updateProduct("edit") }}>
                        確認
                    </button>
                    </div>
                </div>
                </div>
            </div>

            <div ref={deleteProductModalRef} className="modal" tabIndex="-1">
            <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">刪除產品</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                <p>請確定要刪除嗎？</p>
                </div>
                <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
                <button type="button" className="btn btn-primary" onClick={()=> deleteProduct(deleteProductID.current)}>確定</button>
                </div>
            </div>
            </div>
            </div> 
        </>
    )
}

export default ProductPage;