import { useState } from "react";
export default function BotonConfirmar() {
 const [confirmado, setConfirmado] = useState(false);
 return <div><p>{confirmado ? "La operación fue confirmada" : "¿Deseas confirmar la operación?"}</p><button className="btn btn-dark" onClick={() => setConfirmado(true)}>{confirmado ? "Confirmado" : "Confirmar"}</button></div>;
}
