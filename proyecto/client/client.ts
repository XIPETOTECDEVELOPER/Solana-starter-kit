//////////////////// Imports ////////////////////
import { PublicKey } from "@solana/web3.js";

////////////////// Constantes ////////////////////
const NOMBRE_TIENDA = "El Mundo de las Guitarras";

const owner = pg.wallet.publicKey;

//////////////////// Logs base ////////////////////

console.log("Mi wallet:", owner.toBase58());

const balance = await pg.connection.getBalance(owner);

console.log(`Balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

//////////////////// PDA TIENDA ////////////////////

// En Rust:
// seeds = [b"tienda", owner.key().as_ref()]

function pdaTienda(ownerPk: PublicKey) {

  return PublicKey.findProgramAddressSync(
    [Buffer.from("tienda"), ownerPk.toBuffer()],
    pg.PROGRAM_ID
  );

}

//////////////////// Helpers ////////////////////

async function fetchTienda(pda_tienda: PublicKey) {

  return await pg.program.account.tienda.fetch(pda_tienda);

}

function printGuitarras(tiendaAccount: any) {

  const guitarras = tiendaAccount.guitarras as any[];

  if (!guitarras || guitarras.length === 0) {

    console.log("No hay guitarras registradas");

    return;

  }

  console.log(`Guitarras (${guitarras.length})`);

  for (let i = 0; i < guitarras.length; i++) {

    const g = guitarras[i];

    console.log(
      `#${i + 1} -> nombre="${g.nombre}", tipo=${g.tipo}, precio=${g.precio}, disponible=${g.disponible}`
    );

  }

}

//////////////////// Instrucciones ////////////////////

async function crearTienda(nombre: string) {

  const [pda_tienda] = pdaTienda(owner);

  try {

    const existing = await fetchTienda(pda_tienda);

    console.log("La tienda ya existe:", pda_tienda.toBase58());
    console.log("Owner:", existing.owner.toBase58());
    console.log("Nombre:", existing.nombre);

    return;

  } catch (_) {}

  const txHash = await pg.program.methods
    .crearTienda(nombre)
    .accounts({

      owner: owner,
      tienda: pda_tienda,

    })
    .rpc();

  console.log("crearTienda tx:", txHash);

  console.log("Tienda PDA:", pda_tienda.toBase58());

}

async function agregarGuitarra(nombre: string, tipo: string, precio: number) {

  const [pda_tienda] = pdaTienda(owner);

  const txHash = await pg.program.methods
    .agregarGuitarra(nombre, tipo, precio)
    .accounts({

      owner: owner,
      tienda: pda_tienda,

    })
    .rpc();

  console.log("agregarGuitarra tx:", txHash);

  const tiendaAccount = await fetchTienda(pda_tienda);

  printGuitarras(tiendaAccount);

}

async function eliminarGuitarra(nombre: string) {

  const [pda_tienda] = pdaTienda(owner);

  const txHash = await pg.program.methods
    .eliminarGuitarra(nombre)
    .accounts({

      owner: owner,
      tienda: pda_tienda,

    })
    .rpc();

  console.log("eliminarGuitarra tx:", txHash);

  const tiendaAccount = await fetchTienda(pda_tienda);

  printGuitarras(tiendaAccount);

}

async function alternarDisponibilidad(nombre: string) {

  const [pda_tienda] = pdaTienda(owner);

  const txHash = await pg.program.methods
    .alternarDisponibilidad(nombre)
    .accounts({

      owner: owner,
      tienda: pda_tienda,

    })
    .rpc();

  console.log("alternarDisponibilidad tx:", txHash);

  const tiendaAccount = await fetchTienda(pda_tienda);

  printGuitarras(tiendaAccount);

}

async function verGuitarras() {

  const [pda_tienda] = pdaTienda(owner);

  const tiendaAccount = await fetchTienda(pda_tienda);

  console.log("Tienda PDA:", pda_tienda.toBase58());

  console.log("Owner:", tiendaAccount.owner.toBase58());

  console.log("Nombre tienda:", tiendaAccount.nombre);

  printGuitarras(tiendaAccount);

}

//////////////////// Demo ////////////////////

await crearTienda(NOMBRE_TIENDA);

await agregarGuitarra(
  "Fender Stratocaster",
  "Electrica",
  15000
);

await agregarGuitarra(
  "Gibson Les Paul",
  "Electrica",
  22000
);

await alternarDisponibilidad("Gibson Les Paul");

await eliminarGuitarra("Fender Stratocaster");

await verGuitarras();
