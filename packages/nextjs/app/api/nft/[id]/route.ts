import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const metadata = {
    name: `Starknet Bootcamp # ${id}`,
    description: "Certificado oficial de participación en el Starknet Bootcamp by Happ3n y Tecnológico de Sfotware. Prueba criptográfica de conocimientos en Cairo y Scaffold-Stark.",
    image: `${baseUrl}/bootcamp-nft.png`,
    attributes: [
      { trait_type: "Cohort", value: "2026" },
      { trait_type: "Nivel", value: "Desarrollador Junior" },
      { trait_type: "Ecosistema", value: "Starknet" }
    ],
  };

  return NextResponse.json(metadata, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
}
