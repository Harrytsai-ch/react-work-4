
import { useEffect, useRef } from  "react";
import {  Modal } from 'bootstrap';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function DeleteProductModal({setIsDeleteProductModalOpen ,getProductList, id, setIsWaiting}){
    const deleteProductModalRef = useRef(null);
    const deleteProductModalMethodRef = useRef(null); 
   
    useEffect(()=>{
        deleteProductModalMethodRef.current = new Modal(deleteProductModalRef.current, { backdrop:false });
        openDeleteProductModal();
    },[]);

    const openDeleteProductModal = ()=> {
        deleteProductModalMethodRef.current.show();
    }

    const closeDeleteProductModal = ()=> {
        deleteProductModalMethodRef.current.hide();
        setIsDeleteProductModalOpen(false);
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

    return (
        <div ref={deleteProductModalRef} className="modal" tabIndex="-1" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                    <h5 className="modal-title">刪除產品</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={closeDeleteProductModal}></button>
                    </div>
                    <div className="modal-body">
                    <p>請確定要刪除嗎？</p>
                    </div>
                    <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeDeleteProductModal}>關閉</button>
                    <button type="button" className="btn btn-primary" onClick={()=> deleteProduct(id)}>確定</button>
                    </div>
                </div>
            </div>
        </div> 
    )
}

export default DeleteProductModal;