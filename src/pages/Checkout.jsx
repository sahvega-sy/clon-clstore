import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatoCLP } from '../lib/validaciones';
import { REGIONES_Y_COMUNAS } from '../data/regionesYComunas';

export default function Checkout() {
  const { items, total, vaciarCarrito } = useCart();
  const { usuario, perfil } = useAuth();
  const navigate = useNavigate();

  const listaRegiones = Array.isArray(REGIONES_Y_COMUNAS) ? REGIONES_Y_COMUNAS : [];
  const regionInicial = listaRegiones[0]?.region || 'Arica y Parinacota';
  const comunaInicial = listaRegiones[0]?.comunas?.[0] || 'Arica';

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    calle: '',
    departamento: '',
    region: regionInicial,
    comuna: comunaInicial,
    indicaciones: '',
  });

  // AUTOCOMPLETAR CUANDO HAY SESIÓN INICIADA
  useEffect(() => {
    if (usuario || perfil) {
      // 1. Obtener correo del usuario
      const correoUsuario = usuario?.email || perfil?.email || '';

      // 2. Obtener nombres y apellidos (soporta Firebase, Supabase metadata y perfil)
      const nombreUsuario =
        perfil?.nombre ||
        usuario?.user_metadata?.nombre ||
        usuario?.displayName?.split(' ')[0] ||
        '';

      const apellidosUsuario =
        perfil?.apellidos ||
        perfil?.apellido ||
        usuario?.user_metadata?.apellidos ||
        usuario?.displayName?.split(' ').slice(1).join(' ') ||
        '';

      // 3. Obtener dirección (soporta 'calle' o 'direccion')
      const calleUsuario = perfil?.calle || perfil?.direccion || '';
      const deptoUsuario = perfil?.departamento || perfil?.depto || '';
      const indicacionesUsuario = perfil?.indicaciones || '';

      // 4. Determinar Región y Comuna guardadas en el perfil
      const regionPerfil = perfil?.region || '';
      const regionEncontrada = listaRegiones.find((r) => r.region === regionPerfil);

      let regionFinal = regionInicial;
      let comunaFinal = comunaInicial;

      if (regionEncontrada) {
        regionFinal = regionEncontrada.region;
        // Si la comuna guardada pertenece a esta región, la usamos
        if (regionEncontrada.comunas.includes(perfil?.comuna)) {
          comunaFinal = perfil.comuna;
        } else {
          comunaFinal = regionEncontrada.comunas[0] || '';
        }
      }

      // Actualizamos todo el formulario de golpe
      setFormData((prev) => ({
        ...prev,
        nombre: nombreUsuario || prev.nombre,
        apellidos: apellidosUsuario || prev.apellidos,
        correo: correoUsuario || prev.correo,
        calle: calleUsuario || prev.calle,
        departamento: deptoUsuario || prev.departamento,
        region: regionFinal,
        comuna: comunaFinal,
        indicaciones: indicacionesUsuario || prev.indicaciones,
      }));
    }
  }, [usuario, perfil]);

  // Lista de comunas dinámicas según la región seleccionada actualmente
  const regionSeleccionadaObj = listaRegiones.find((r) => r.region === formData.region);
  const comunasDisponibles = regionSeleccionadaObj?.comunas || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = (e) => {
    const nuevaRegion = e.target.value;
    const regionObj = listaRegiones.find((r) => r.region === nuevaRegion);
    const primeraComuna = regionObj?.comunas?.[0] || '';

    setFormData((prev) => ({
      ...prev,
      region: nuevaRegion,
      comuna: primeraComuna,
    }));
  };

  const handlePagar = (e) => {
    e.preventDefault();

    Swal.fire({
      title: '¡Compra completada!',
      text: `Gracias por tu compra en CLstore. Se enviará la confirmación a ${formData.correo}.`,
      icon: 'success',
      confirmButtonText: 'Genial',
      confirmButtonColor: '#0d6efd',
    }).then(() => {
      vaciarCarrito();
      navigate('/');
    });
  };

  if (items.length === 0) {
    return (
      <div className="container text-center py-5">
        <h4>No hay productos en tu carrito para procesar el pago.</h4>
        <button className="btn btn-primary rounded-pill mt-3" onClick={() => navigate('/productos')}>
          Ver Productos
        </button>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4 text-dark">
      <div className="container" style={{ maxWidth: '850px' }}>
        <form onSubmit={handlePagar} className="bg-white p-4 p-md-5 rounded shadow-sm border">
          
          {/* AVISO SI ESTÁ AUTENTICADO */}
          {usuario && (
            <div className="alert alert-info py-2 px-3 mb-4 small d-flex align-items-center justify-content-between">
              <span>
                💡 Sesión iniciada como <strong>{formData.correo}</strong>. Hemos autocompletado tus datos.
              </span>
            </div>
          )}

          {/* TABLA DE PRODUCTOS */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="h4 fw-bold m-0">Carrito de compra</h2>
              <small className="text-muted">Completa la siguiente información</small>
            </div>
            <span className="badge bg-primary px-3 py-2 fs-6">
              Total a pagar: {formatoCLP(total)}
            </span>
          </div>

          <div className="table-responsive mb-4">
            <table className="table align-middle text-center border-top">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="text-start">Imagen</th>
                  <th scope="col" className="text-start">Nombre</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const p = it.productos || {};
                  const subtotal = (p.precio || 0) * it.cantidad;
                  return (
                    <tr key={it.producto_id}>
                      <td className="text-start">
                        <img
                          src={p.imagen}
                          alt={p.nombre}
                          style={{ width: '40px', height: '30px', objectFit: 'cover' }}
                          className="rounded"
                        />
                      </td>
                      <td className="text-start fw-medium">{p.nombre}</td>
                      <td>{formatoCLP(p.precio)}</td>
                      <td>{it.cantidad}</td>
                      <td>{formatoCLP(subtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DATOS PERSONALES */}
          <div className="mb-4">
            <h3 className="h5 fw-bold mb-0">Información del cliente</h3>
            <small className="text-muted d-block mb-3">Completa la siguiente información</small>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted small fw-semibold">Nombre*</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small fw-semibold">Apellidos*</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small fw-semibold">Correo*</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* DIRECCIÓN CON REGIONES Y COMUNAS */}
          <div className="mb-4">
            <h3 className="h5 fw-bold mb-0">Dirección de entrega de los productos</h3>
            <small className="text-muted d-block mb-3">Ingrese dirección de forma detallada</small>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted small fw-semibold">Calle*</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  name="calle"
                  value={formData.calle}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small fw-semibold">Departamento (opcional)</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="Ej: 603"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small fw-semibold">Región*</label>
                <select
                  className="form-select bg-light"
                  name="region"
                  value={formData.region}
                  onChange={handleRegionChange}
                  required
                >
                  {listaRegiones.map((reg) => (
                    <option key={reg.region} value={reg.region}>
                      {reg.region}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small fw-semibold">Comuna*</label>
                <select
                  className="form-select bg-light"
                  name="comuna"
                  value={formData.comuna}
                  onChange={handleChange}
                  required
                >
                  {comunasDisponibles.map((com) => (
                    <option key={com} value={com}>
                      {com}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label text-muted small fw-semibold">Indicaciones para la entrega (opcional)</label>
                <textarea
                  className="form-control bg-light"
                  rows="3"
                  placeholder="Ej.: Entre calles, color del edificio, no tiene timbre."
                  name="indicaciones"
                  value={formData.indicaciones}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button type="submit" className="btn btn-success btn-lg px-4 fs-6 fw-semibold">
              Pagar ahora {formatoCLP(total)}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}