# Gastos MG

App web personal para registrar ingresos y gastos, con sincronizacion en Supabase.

## Probar en tu PC

```powershell
cd "c:\Users\MARIANO\OneDrive\Scripts\Gastos MG"
python -m http.server 8091
```

Abrir:

`http://localhost:8091/index.html?app=gastos-mg-personal`

## Publicar en Vercel (gratis)

1. Crea un repo nuevo en GitHub (ejemplo: `gastos-mg`).
2. Sube el contenido de esta carpeta (`Gastos MG`) a la raiz del repo.
3. Entra en `https://vercel.com` e inicia sesion con GitHub.
4. Pulsa `Add New...` -> `Project`.
5. Importa el repo `gastos-mg`.
6. En configuracion deja todo por defecto y pulsa `Deploy`.
7. Vercel te dara una URL publica tipo:
   `https://gastos-mg.vercel.app`

## Instalar en iPhone

1. Abre la URL publica en Safari.
2. Pulsa `Compartir`.
3. Pulsa `Agregar a pantalla de inicio`.
4. Queda como app en el escritorio.

## Nota de login

- Si ya iniciaste sesion una vez, queda guardada.
- Si cambias de dispositivo, inicia sesion con el mismo email para ver tus datos.
