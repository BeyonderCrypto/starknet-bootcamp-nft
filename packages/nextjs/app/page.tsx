"use client";

import { useEffect, useState } from "react";
import { useAccount } from "@starknet-start/react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";

interface NFTAttribute { trait_type: string; value: string; }
interface NFTMetadata { name: string; description: string; image: string; attributes: NFTAttribute[]; }

export default function Home() {
  const { address, isConnected } = useAccount();
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);

  // Consultas al Smart Contract
  const { data: hasMinted, isLoading: isChecking } = useScaffoldReadContract({
    contractName: "BootcampNFT",
    functionName: "has_minted",
    args: [address as string],
  });

  const { data: isAllowed } = useScaffoldReadContract({
    contractName: "BootcampNFT",
    functionName: "is_student_allowed",
    args: [address as string],
  });

  // Preparación de transacción
  const { sendAsync: mintNFT, isPending: isMinting } = useScaffoldWriteContract({
    contractName: "BootcampNFT",
    functionName: "mint",
    args: [],
  });

  // Fetch de Metadata cuando el estado cambia a minteado
  useEffect(() => {
    if (hasMinted) {
      fetch("/api/nft/1")
        .then((res) => res.json())
        .then((data) => setMetadata(data))
        .catch((err) => console.error(err));
    } else {
      setMetadata(null);
    }
  }, [hasMinted, address]);

  const handleMint = async () => {
    try { await mintNFT(); } catch (e) { console.error(e); }
  };

  const renderButton = () => {
    if (isChecking) return <button disabled className="btn btn-disabled">Verificando estado...</button>;
    if (hasMinted) return <button disabled className="btn btn-success text-white">✅ Certificado Obtenido</button>;
    if (!isAllowed) return <button disabled className="btn btn-error text-white">No estás en la Allowlist</button>;

    return (
      <button onClick={handleMint} disabled={isMinting} className="btn btn-primary">
        {isMinting ? "Firmando en L2..." : "Mintear Mi Certificado"}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center flex-grow pt-10 pb-20 bg-base-100">
      <div className="px-5 text-center max-w-2xl w-full">
        <h1 className="text-5xl font-extrabold text-primary mb-4">Starknet Bootcamp</h1>
        <p className="text-lg mb-8">Obtén tu prueba criptográfica de participación.</p>

        {isConnected ? (
          <div className="flex flex-col items-center gap-8">
            {renderButton()}

            {hasMinted && metadata && (
              <div className="mt-8 p-6 bg-base-200 rounded-3xl shadow-xl max-w-sm w-full animate-fade-in">
                <h2 className="text-2xl font-bold mb-4">¡Felicidades! 🎉</h2>
                <img src={metadata.image} alt={metadata.name} className="w-full rounded-xl border-2 border-primary/20 mb-4" />
                <h3 className="text-xl font-bold text-primary">{metadata.name}</h3>
                <p className="text-sm mt-2">{metadata.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {metadata.attributes.map((attr, index) => (
                    <div key={index} className="bg-base-300 p-2 rounded-lg text-center">
                      <span className="block text-xs uppercase font-bold text-primary/70">{attr.trait_type}</span>
                      <span className="block text-sm font-semibold">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="alert alert-warning">👆 Conecta tu wallet en el menú superior.</div>
        )}
      </div>
    </div>
  );
}
