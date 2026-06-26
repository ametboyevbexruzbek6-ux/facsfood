import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MdAdd, MdEdit, MdDelete, MdClose, MdImage, MdRestaurantMenu } from 'react-icons/md';

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({ id: null, name: '', description: '', price: '', status: 'Mavjud', isTop: false, image: null });
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Mahsulotlarni yuklashda xatolik', error);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setCurrentProduct({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        status: product.status,
        isTop: product.isTop === 1,
        image: null
      });
      setPreviewImage(product.image ? product.image : null);
    } else {
      setCurrentProduct({ id: null, name: '', description: '', price: '', status: 'Mavjud', isTop: false, image: null });
      setPreviewImage(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentProduct({ ...currentProduct, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', currentProduct.name);
    formData.append('description', currentProduct.description);
    formData.append('price', currentProduct.price);
    formData.append('status', currentProduct.status);
    formData.append('isTop', currentProduct.isTop);
    if (currentProduct.image) {
      formData.append('image', currentProduct.image);
    }

    try {
      if (currentProduct.id) {
        await axios.put(`/api/products/${currentProduct.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Saqlashda xatolik', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Rostdan ham bu mahsulotni o'chirmoqchimisiz?")) {
      try {
        await axios.delete(`/api/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error("O'chirishda xatolik", error);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <div>
          <h1>Menyu boshqaruvi <span className="title-icon">🍽️</span></h1>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <MdAdd style={{ fontSize: '20px' }} /> Yangi mahsulot
        </button>
      </div>

      <div className="menu-grid mt-4">
        {products.map(product => (
          <div key={product.id} className="menu-card">
            <div className="menu-img-container">
              {product.image ? (
                <img src={product.image} alt={product.name} />
              ) : (
                <MdRestaurantMenu style={{ fontSize: '64px', color: '#fcd34d' }} />
              )}
            </div>
            <div className="menu-details">
              <h3 style={{ margin: '0 0 4px 0' }}>{product.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', flex: 1 }}>{product.description}</p>
              
              <div className="menu-tags">
                <span className="tag dark">{product.status}</span>
                {product.isTop === 1 && <span className="tag outline">TOP</span>}
              </div>

              <div className="menu-footer">
                <div className="menu-price">{formatPrice(product.price)}</div>
                <div className="d-flex gap-3">
                  <button className="btn-outline" style={{ padding: '6px' }} onClick={() => handleOpenModal(product)}>
                    <MdEdit />
                  </button>
                  <button className="btn-danger" style={{ padding: '6px' }} onClick={() => handleDelete(product.id)}>
                    <MdDelete />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{currentProduct.id ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}</h3>
              <button className="close-btn" onClick={handleCloseModal}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                
                <div className="form-group" style={{ textAlign: 'center' }}>
                  <div 
                    style={{ 
                      width: '120px', height: '120px', borderRadius: 'var(--radius-lg)', 
                      background: '#f1f5f9', margin: '0 auto 16px auto', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                      border: '2px dashed var(--border-color)', cursor: 'pointer'
                    }}
                    onClick={() => fileInputRef.current.click()}
                  >
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                        <MdImage style={{ fontSize: '32px' }} /><br/><span style={{fontSize: '12px'}}>Rasm yuklash</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomi</label>
                  <input type="text" className="form-input" required value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} placeholder="Masalan: Klassik Burger" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tarkibi (Ta'rifi)</label>
                  <textarea className="form-input" rows="3" value={currentProduct.description} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} placeholder="Mol go'shti, salat, pomidor..."></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Narxi (so'm)</label>
                  <input type="number" className="form-input" required value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} placeholder="35000" />
                </div>

                <div className="d-flex gap-3">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Holati</label>
                    <select className="form-input" value={currentProduct.status} onChange={e => setCurrentProduct({...currentProduct, status: e.target.value})}>
                      <option value="Mavjud">Mavjud</option>
                      <option value="Mavjud emas">Mavjud emas</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ marginBottom: '16px' }}>Qo'shimcha</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={currentProduct.isTop} onChange={e => setCurrentProduct({...currentProduct, isTop: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                      TOP mahsulot
                    </label>
                  </div>
                </div>

              </div>
              <div className="modal-header" style={{ justifyContent: 'flex-end', gap: '12px', background: '#f8fafc' }}>
                <button type="button" className="btn-outline" onClick={handleCloseModal}>Bekor qilish</button>
                <button type="submit" className="btn-primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
