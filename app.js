const clima = document.getElementById('clima');
const tarjetaClima = document.getElementById('tarjeta-clima');
const consejo = document.getElementById('consejo');
const tarjetaConsejo = document.getElementById('tarjeta-consejo');
const animo = document.getElementById('animo');
const tarjetaAnimo = document.getElementById('tarjeta-animo');
const recargar = document.getElementById('btn-recargar');
const tarjetaResumen = document.getElementById('tarjeta-resumen');
const resumen = document.getElementById('resumen');

class ErrorHTTP extends Error
{
    constructor(mensaje){
        super(mensaje)
        this.name = 'Error HTTP'
    }
}

recargar.addEventListener('click', () => {
    preguntarInfo()
})

async function preguntarInfo()
{
    clima.textContent = 'Trabajando en tu bienestar...';
    tarjetaClima.className = 'tarjeta cargando';
    consejo.textContent = 'Trabajando en tu bienestar...';
    tarjetaConsejo.className = 'tarjeta cargando'
    animo.textContent = 'Trabajando en tu bienestar...';
    tarjetaAnimo.className = 'tarjeta cargando';
    resumen.textContent = 'Comparando estado de ánimo...';
    tarjetaResumen.className = 'tarjeta cargando';
   

    const comienzo = performance.now()
    const resultado = await Promise.allSettled([fetchClima(), fetchConsejo(), fetchAnimo()])

    renderWeather(resultado[0])
    renderConsejo(resultado[1])
    renderAnimo(resultado[2].value)
    const final = performance.now() - comienzo
    console.log(`Tiempo de Ejecución = ${final}`)
}

async function fetchClima()
{
    try
    {
         const climaFetch = await fetch('https://api.open-meteo.com/v1/forecast?latitude=55.68&longitude=12.57&hourly=temperature_2m'); 

        if(!climaFetch.ok)
            throw new ErrorHTTP(`Error de Servidor ${climaFetch.status}. Intenta más tarde 😭.`)     

        else
        {
            let climaHoy = await climaFetch.json()
            return climaHoy
        }
    }
    catch(err)
    {
        if(err instanceof ErrorHTTP)
            throw new Error(err.message)

        else if(err instanceof TypeError)
            throw new Error("Error de conexión. Verifica tu red o intenta más tarde 😭.")     

        else 
            throw new Error("Ocurrió un error inesperado al obtener el clima 😭.")
    }
}

async function fetchConsejo()
{
    try
    {
        const consejoFetch = await fetch('https://api.adviceslip.com/advice'); 

        if(!consejoFetch.ok)
            throw new ErrorHTTP(`Error de Servidor ${consejoFetch.status}. Intenta más tarde 😭.`)

        else
        {
            let consejoHoy = await consejoFetch.json()
            return consejoHoy
        }
            
    }
    catch(err)
    {

        if(err instanceof ErrorHTTP)
            throw new Error(err.message)

        else if(err instanceof TypeError)
            throw new Error("Error de conexión. Verifica tu red o intenta más tarde 😭.")

        else 
            throw new Error("Ocurrió un error inesperado al obtener el consejo 😭.")
    } 
}

async function fetchAnimo()
{
    const animoSemanal = await registroAnimo();
    return animoSemanal;
}

function registroAnimo() { 
  return new Promise((resolve) => { 
    resolve([ 
       
      { dia: 'Lun', valor: 5 }, 
      { dia: 'Mar', valor: 5 }, 
      { dia: 'Mie', valor: 2 }, 
      { dia: 'Jue', valor: 5 }, 
      { dia: 'Vie', valor: 2 }, 
      { dia: 'Sab', valor: 1 }, 
      { dia: 'Dom', valor: 3 } 
    ]); 
  }); 
}

function renderWeather(resultado)
{
    if(resultado.status === "rejected")
    {
        clima.textContent = resultado.reason;
        tarjetaClima.className = 'tarjeta error';
    }

    else
    {
            tarjetaClima.className = 'tarjeta';
            const ISOFechaHora = resultado.value.hourly.time[0]; 
            const temp = resultado.value.hourly.temperature_2m[0]; 
            const unidad = resultado.value.hourly_units.temperature_2m; 
    
            const fecha = new Date(ISOFechaHora);

            const diaTexto = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }); 


            clima.textContent = `Temperatura: ${temp}${unidad} Dia: ${diaTexto}.`
    }
}

function renderConsejo(resultado)
{
    if(resultado.status === "rejected")
    {
         consejo.textContent = resultado.reason
         tarjetaConsejo.className = 'tarjeta error';
    }
        
    else
    {
        tarjetaConsejo.className = 'tarjeta';
        consejo.textContent = resultado.value.slip.advice
    }
        
}

function renderAnimo(resultado)
{
    try
    {
        if(!resultado)
            throw new Error('Whoops! Información no Encontrada. Intenta más Tarde 😭.')
        
        else
        {
            animo.textContent = ''
            tarjetaAnimo.className = 'tarjeta ancha'

            for(let i = 0; i < resultado.length; i++)
            {
                    const dia = document.createElement('div');
                    dia.className = 'dia';

                    const barra = document.createElement('div');
                    barra.className = 'barra';
                    barra.style.height = `${resultado[i].valor * 20}%`;


                    const etiqueta = document.createElement('span');
                    etiqueta.className = 'etiqueta';
                    etiqueta.textContent = `${resultado[i].dia}`;

                    dia.appendChild(barra); 
                    dia.appendChild(etiqueta);
                    animo.appendChild(dia);    
            }

            renderResumen(resultado)
        }
    }
    catch(err)
    {
        animo.textContent = err.message
        resumen.textContent = err.message
    }
}

function renderResumen(resultado)
{

    tarjetaResumen.className = 'tarjeta';
    let cuatroDiasAntes = 0;
    let ultimosTresDias = 0;
    for(let i = 0; i < 4; i++)
    {
        cuatroDiasAntes = cuatroDiasAntes + resultado[i].valor
    }

        let primerSuma = (cuatroDiasAntes/4) * 20

    for(let i1 = 4; i1 < 7; i1++)
    {
        ultimosTresDias = ultimosTresDias + resultado[i1].valor
    }

        let segundaSuma = (ultimosTresDias/3) * 20

    if(primerSuma > segundaSuma)
        resumen.textContent = `Tu ánimo en los primeros 4 dias fue de un ${primerSuma.toFixed(2)}%
        en promedio. En los últimos 3 dias fue de un ${segundaSuma.toFixed(2)}%, ha bajado pero mejoraremos 😊.`
    
    else
        resumen.textContent = `Tu ánimo en los primeros 4 dias fue de un ${primerSuma.toFixed(2)}%
        en promedio. En los últimos 3 dias fue de un ${segundaSuma.toFixed(2)}%, ha ido mejorando 😊.`
}