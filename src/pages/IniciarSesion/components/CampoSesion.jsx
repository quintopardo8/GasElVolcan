
// de iniciar sesion y recuperar contraseña

export default function CampoSesion({
  id,
  etiqueta,
  type = "text",
  name,
  value,
  onChange,
  error,
}) {
  return (
    <>
      <label htmlFor={id}>{etiqueta}</label>
      <br /><br />
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
      />
      <p className="error">{error}</p>
    </>
  );
}
