"use client";

import { useState, useRef } from "react";
import { useAccount } from "~~/hooks/useAccount";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";

export default function AdminPage() {
  const { address } = useAccount();
  const [walletsInput, setWalletsInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: ownerAddress } = useScaffoldReadContract({ contractName: "BootcampNFT", functionName: "owner" });
  
  const { sendAsync: addStudents, isPending } = useScaffoldWriteContract({
    contractName: "BootcampNFT",
    functionName: "add_students",
    args: [[]],
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const extractedAddresses = text.split(/[\s,]+/).map(a => a.trim()).filter(a => a.startsWith("0x"));
      setWalletsInput(extractedAddresses.join("\n"));
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    const finalWallets = walletsInput.split(/[\s,]+/).map(w => w.trim()).filter(w => w.startsWith("0x"));
    if (finalWallets.length === 0) return alert("No hay direcciones válidas.");
    
    try {
      await addStudents({ args: [finalWallets] });
      alert("Transacción de Batch enviada.");
      setWalletsInput("");
    } catch (error) { console.error(error); }
  };

  let isDenied = true;
  try {
    if (address && ownerAddress) {
      isDenied = BigInt(address) !== BigInt(ownerAddress.toString());
    }
  } catch (e) {}

  if (isDenied) {
    return <div className="text-center pt-20"><h1 className="text-3xl font-bold text-red-500">⛔ Acceso Denegado</h1></div>;
  }

  return (
    <div className="flex flex-col items-center flex-grow pt-10 pb-20">
      <div className="w-full max-w-3xl px-5">
        <h1 className="text-4xl font-extrabold mb-4 text-primary">Panel Admin</h1>
        <div className="bg-base-200 p-6 rounded-2xl shadow-lg border border-base-300">
          <label className="block text-sm font-bold mb-2">Opción 1: Archivo CSV / TXT</label>
          <input type="file" accept=".csv, .txt" ref={fileInputRef} onChange={handleFileUpload} className="file-input w-full max-w-xs mb-6" />
          
          <div className="divider">O</div>
          
          <label className="block text-sm font-bold mb-2">Opción 2: Pegar Direcciones</label>
          <textarea value={walletsInput} onChange={e => setWalletsInput(e.target.value)} className="textarea textarea-bordered w-full h-48 mb-6 font-mono text-sm"></textarea>
          
          <button onClick={handleSubmit} disabled={isPending || !walletsInput} className="btn btn-primary w-full">
            {isPending ? "Procesando Batch Tx..." : "Registrar Estudiantes"}
          </button>
        </div>
      </div>
    </div>
  );
}
