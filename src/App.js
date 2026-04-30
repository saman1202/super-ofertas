import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  const [phones, setPhones] = useState([]);
  const [form, setForm] = useState({ model: '', storage: '', price: '' });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const printRef = useRef();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!form.model.trim() || !form.price.trim()) return;
    if (editId !== null) {
      setPhones(phones.map(p => p.id === editId ? { ...p, ...form } : p));
      setEditId(null);
    } else {
      setPhones([...phones, { ...form, id: Date.now() }]);
    }
    setForm({ model: '', storage: '', price: '' });
    setShowForm(false);
  };

  const handleEdit = (phone) => {
    setForm({ model: phone.model, storage: phone.storage, price: phone.price });
    setEditId(phone.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setPhones(phones.filter(p => p.id !== id));
  };

  const handleCancel = () => {
    setForm({ model: '', storage: '', price: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    let heightLeft = pdfHeight;
    let yOffset = 0;

    pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      yOffset -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('super-ofertas.pdf');
  };

  return (
    <div className="app-container">
      <div className="app-header no-print">
        <h1>SUPER OFERTAS</h1>
        <p>Gestión de Precios</p>
      </div>

      <div className="action-bar no-print">
        <button className="btn btn-primary" onClick={() => { handleCancel(); setShowForm(true); }}>
          + Añadir Teléfono
        </button>
        {phones.length > 0 && (
          <>
            <button className="btn btn-secondary" onClick={handlePrint}>
              🖨️ Imprimir
            </button>
            <button className="btn btn-success" onClick={handleDownloadPDF}>
              📄 Descargar PDF
            </button>
          </>
        )}
      </div>

      {showForm && (
        <div className="form-overlay no-print">
          <div className="form-card">
            <h2>{editId ? 'Editar Teléfono' : 'Añadir Teléfono'}</h2>
            <div className="form-group">
              <label>Modelo</label>
              <input
                type="text"
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Ej: SAMSUNG A56 5G"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="form-group">
              <label>Almacenamiento</label>
              <input
                type="text"
                name="storage"
                value={form.storage}
                onChange={handleChange}
                placeholder="Ej: 8/256GB"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="form-group">
              <label>Precio (€)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Ej: 295"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleAdd}>
                {editId ? 'Actualizar' : 'Añadir'}
              </button>
              <button className="btn btn-outline" onClick={handleCancel}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={printRef} className="print-area">
        <div className="print-header">
          <h2>SUPER OFERTAS</h2>
        </div>
        {phones.length === 0 ? (
          <div className="empty-state no-print">
            <p>No hay teléfonos añadidos aún.</p>
            <p>Haz clic en <strong>"+ Añadir Teléfono"</strong> para empezar.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {phones.map(phone => (
              <div key={phone.id} className="oferta-card">
                <div className="oferta-header">SUPER OFERTA</div>
                <div className="oferta-body">
                  <div className="oferta-model">{phone.model}</div>
                  {phone.storage && (
                    <div className="oferta-storage">({phone.storage})</div>
                  )}
                  <div className="oferta-price-row">
                    <span className="oferta-precio-label">PRECIO</span>
                    <span className="oferta-price">{phone.price}€</span>
                  </div>
                </div>
                <div className="oferta-edit-btns no-print">
                  <button className="btn-icon" onClick={() => handleEdit(phone)} title="Editar">✏️</button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(phone.id)} title="Eliminar">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
