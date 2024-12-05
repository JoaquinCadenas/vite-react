import { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';  // Asegúrate de que el cliente esté configurado correctamente

function App() {
  const [data, setData] = useState([]);
  const [newRecord, setNewRecord] = useState({ nombre: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);  // Estado para manejar la edición
  const [currentRecord, setCurrentRecord] = useState({ id: null, nombre: '', email: '' });

  // Cargar los datos al iniciar
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('usuarios').select('*');
      if (error) throw error;
      setData(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);  // Ahora puedes acceder a 'message' sin problemas
      } else {
        console.error('Error desconocido');
      }
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo registro
  const createData = async () => {
    if (!newRecord.nombre || !newRecord.email) return;  // Validación simple
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([newRecord]);

      if (error) throw error;
      setData((prevData) => [...prevData, ...data]);
      setNewRecord({ nombre: '', email: '' });  // Limpiar el formulario
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);  // Ahora puedes acceder a 'message' sin problemas
      } else {
        console.error('Error desconocido');
      }
    }
  };

  // Iniciar la edición de un registro
  const startEditing = (item) => {
    setEditing(true);
    setCurrentRecord(item);  // Cargar los datos del registro en el formulario
  };

  // Actualizar el registro
  const updateData = async () => {
    if (!currentRecord.nombre || !currentRecord.email) return;  // Validación simple
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .upsert([{ id: currentRecord.id, nombre: currentRecord.nombre, email: currentRecord.email }]);
  
      if (error) throw error;
  
      if (data && data.length > 0) {
        // Asegúrate de que 'data' tenga datos antes de intentar acceder a 'data[0]'
        setData((prevData) =>
          prevData.map((item) => (item.id === currentRecord.id ? data[0] : item))
        );
      } else {
        console.error('No se devolvieron datos actualizados.');
      }
  
      // Resetear el estado de edición
      setEditing(false);
      setCurrentRecord({ id: null, nombre: '', email: '' });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);  // Ahora puedes acceder a 'message' sin problemas
      } else {
        console.error('Error desconocido');
      }
    }
  };

  // Eliminar registro
  const deleteData = async (id) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .match({ id });

      if (error) throw error;

      setData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);  // Ahora puedes acceder a 'message' sin problemas
      } else {
        console.error('Error desconocido');
      }
    }
  };

  // Cargar los datos al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Registros de la Base de Datos</h1>
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div>
          <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nombre}</td>
                  <td>{item.email}</td>
                  <td>
                    <button onClick={() => startEditing(item)}>Editar</button>
                    <button onClick={() => deleteData(item.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Formulario de creación o edición */}
          <h2>{editing ? 'Editar Registro' : 'Agregar Nuevo Registro'}</h2>
          <input
            type="text"
            placeholder="Nombre"
            value={editing ? currentRecord.nombre : newRecord.nombre}
            onChange={(e) => {
              if (editing) {
                setCurrentRecord({ ...currentRecord, nombre: e.target.value });
              } else {
                setNewRecord({ ...newRecord, nombre: e.target.value });
              }
            }}
          />
          <input
            type="email"
            placeholder="Email"
            value={editing ? currentRecord.email : newRecord.email}
            onChange={(e) => {
              if (editing) {
                setCurrentRecord({ ...currentRecord, email: e.target.value });
              } else {
                setNewRecord({ ...newRecord, email: e.target.value });
              }
            }}
          />
          <button onClick={editing ? updateData : createData}>
            {editing ? 'Actualizar' : 'Agregar'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
