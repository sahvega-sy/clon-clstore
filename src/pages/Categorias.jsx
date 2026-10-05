import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Asegúrate de que la ruta coincida con tu cliente de Supabase

export default function Categorias({ agregarAlCarrito }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    setCargando(true);
    // Obtener productos desde Supabase
    const { data, error } = await supabase.from('productos').select('*');

    if (error) {
      console.error('Error al obtener productos:', error);
    } else if (data) {
      setProductos(data);

      // Extraer lista única de categorías de los productos
      const listaCategorias = ['Todas', ...new Set(data.map((p) => p.categoria || p.category).filter(Boolean))];
      setCategorias(listaCategorias);
    }
    setCargando(false);
  };

  // Filtrar productos según la categoría seleccionada
  const productosFiltrados =
    categoriaSeleccionada === 'Todas'
      ? productos
      : productos.filter(
          (p) => (p.categoria || p.category) === categoriaSeleccionada
        );

  if (cargando) {
    return <div className="container text-center my-5">Cargando categorías...</div>;
  }

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Categorías</h2>

      {/* Botones / Tarjetas de Selección de Categoría (Diseño superior) */}
      <div className="row row-cols-2 row-cols-md-4 g-3 mb-5 justify-content-center">
        {categorias.map((cat, index) => (
          <div key={index} className="col">
            <button
              onClick={() => setCategoriaSeleccionada(cat)}
              className={`btn w-100 p-3 shadow-sm ${
                categoriaSeleccionada === cat
                  ? 'btn-primary active'
                  : 'btn-outline-secondary bg-white text-dark'
              }`}
            >
              <div className="fw-semibold">{cat}</div>
            </button>
          </div>
        ))}
      </div>

      {/* Título de la Categoría Activa */}
      <h3 className="mb-4 border-bottom pb-2">
        {categoriaSeleccionada === 'Todas' ? 'Todos los Productos' : categoriaSeleccionada}
      </h3>

      {/* Grilla de Productos Filtrados */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((prod) => (
            <div key={prod.id} className="col">
              <div className="card h-100 shadow-sm">
                <img
                  src={prod.imagen || prod.image || 'https://via.placeholder.com/400x300'}
                  className="card-img-top p-2"
                  alt={prod.nombre || prod.title}
                  style={{ height: '200px', objectFit: 'contain' }}
                />
                <div className="card-body d-flex flex-column justify-content-between">
                  <h5 className="card-title fs-6">{prod.nombre || prod.title}</h5>
                  <div>
                    <p className="card-text fw-bold text-primary fs-5 mb-2">
                      ${Number(prod.precio || prod.price || 0).toLocaleString('es-CL')}
                    </p>
                    {agregarAlCarrito && (
                      <button
                        onClick={() => agregarAlCarrito(prod)}
                        className="btn btn-dark w-100 btn-sm"
                      >
                        Añadir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <p className="text-muted">No hay productos disponibles en esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  );
}