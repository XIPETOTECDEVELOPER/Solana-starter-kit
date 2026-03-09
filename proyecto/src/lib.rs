use anchor_lang::prelude::*;

declare_id!("FgfurVUP77YBvK3i4qTfSaQm4kX6ktTBxioD8xG8PHfW");

#[program]
pub mod mundo_guitarras {
    use super::*;

    pub fn crear_tienda(ctx: Context<NuevaTienda>, nombre: String) -> Result<()> {

        let owner = ctx.accounts.owner.key();
        let guitarras: Vec<Guitarra> = Vec::new();

        ctx.accounts.tienda.set_inner(Tienda {
            owner,
            nombre,
            guitarras,
        });

        msg!("Tienda creada correctamente");

        Ok(())
    }

    pub fn agregar_guitarra(
        ctx: Context<NuevaGuitarra>,
        nombre: String,
        tipo: String,
        precio: u16
    ) -> Result<()> {

        let guitarra = Guitarra {
            nombre,
            tipo,
            precio,
            disponible: true,
        };

        ctx.accounts.tienda.guitarras.push(guitarra);

        msg!("Guitarra agregada");

        Ok(())
    }

    pub fn ver_guitarras(ctx: Context<NuevaGuitarra>) -> Result<()> {

        msg!(
            "Lista de guitarras: {:#?}",
            ctx.accounts.tienda.guitarras
        );

        Ok(())
    }

    pub fn eliminar_guitarra(ctx: Context<NuevaGuitarra>, nombre: String) -> Result<()> {

        let guitarras = &mut ctx.accounts.tienda.guitarras;

        for guitarra in 0..guitarras.len() {

            if guitarras[guitarra].nombre == nombre {

                guitarras.remove(guitarra);

                msg!("Guitarra {} eliminada", nombre);

                return Ok(());

            }

        }

        Err(Errores::GuitarraNoExiste.into())
    }

    pub fn alternar_disponibilidad(ctx: Context<NuevaGuitarra>, nombre: String) -> Result<()> {

        let guitarras = &mut ctx.accounts.tienda.guitarras;

        for guitarra in 0..guitarras.len() {

            let estado = guitarras[guitarra].disponible;

            if guitarras[guitarra].nombre == nombre {

                let nuevo_estado = !estado;

                guitarras[guitarra].disponible = nuevo_estado;

                msg!(
                    "La guitarra {} ahora tiene disponibilidad: {}",
                    nombre,
                    nuevo_estado
                );

                return Ok(());

            }

        }

        Err(Errores::GuitarraNoExiste.into())
    }

}

#[error_code]
pub enum Errores {

    #[msg("No eres el propietario de la tienda.")]
    NoEresElOwner,

    #[msg("La guitarra no existe.")]
    GuitarraNoExiste,

}

#[account]
#[derive(InitSpace)]
pub struct Tienda {

    pub owner: Pubkey,

    #[max_len(60)]
    pub nombre: String,

    #[max_len(20)]
    pub guitarras: Vec<Guitarra>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace, PartialEq, Debug)]
pub struct Guitarra {

    #[max_len(60)]
    pub nombre: String,

    #[max_len(30)]
    pub tipo: String,

    pub precio: u16,

    pub disponible: bool,
}

#[derive(Accounts)]
pub struct NuevaTienda<'info> {

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = Tienda::INIT_SPACE + 8,
        seeds = [b"tienda", owner.key().as_ref()],
        bump
    )]
    pub tienda: Account<'info, Tienda>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct NuevaGuitarra<'info> {

    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"tienda", owner.key().as_ref()],
        bump
    )]
    pub tienda: Account<'info, Tienda>,
}
