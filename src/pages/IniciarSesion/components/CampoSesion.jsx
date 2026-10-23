export default function CampoSesion({
  id,
  etiqueta,
  type = "text",
  name,
  value,
  onChange,
  error,
  placeholder,
}) {
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <p className="error">{error}</p>
    </div>
  );
}