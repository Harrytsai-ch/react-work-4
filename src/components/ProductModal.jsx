import { useEffect, useRef, useState } from  "react";
import {  Modal } from 'bootstrap';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({ setIsProductModalOpen, getProductList, modalMode, tempProduct, setTempProduct}){
    const productModalRef = useRef(null);
    const productModalMethodRef = useRef(null);
    const [isWaiting, setIsWaiting] = useState(false);
    
    useEffect(()=>{
        //初始化必執行
        productModalMethodRef.current = new Modal(productModalRef.current, { backdrop:false });
        openProductModal();
    },[]);

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

    const inputProductModal = (e)=>{
        //當前input標籤的屬性存放下來
        const { name, value, type, checked } = e.target
        setTempProduct({
            ...tempProduct,
            [name]: type === "checkbox" ? checked : value
        })
        console.log(tempProduct);
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
        })} catch (error) {
            alert(error, '編輯產品失敗');
        }
    }

    const closeProductModal = ()=> {
        productModalMethodRef.current.hide();
        setIsProductModalOpen(false);
    }

    const openProductModal = ()=>{
        productModalMethodRef.current.show();
    }

    return (
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
    )   
}

export default ProductModal;