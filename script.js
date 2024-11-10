let map; // Variable para almacenar la instancia del mapa
let mapInitialized = false; // Control para verificar si el mapa ha sido inicializado

// Cargar la lista de países
fetch('https://countriesnow.space/api/v0.1/countries')
    .then(response => response.json())
    .then(data => {
        const countryComboBox = document.getElementById('countryComboBox');
        data.data.sort((a, b) => a.country.localeCompare(b.country));
        
        data.data.forEach(country => {
            const option = document.createElement('option');
            option.value = country.country;
            option.text = country.country;
            countryComboBox.add(option);
        });
    });

// Cargar ciudades
document.getElementById('countryComboBox').addEventListener('change', function() {
    const selectedCountry = this.value;
    if (selectedCountry) {
        fetch('https://countriesnow.space/api/v0.1/countries/cities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ country: selectedCountry })
        })
        .then(response => response.json())
        .then(data => {
            const cityComboBox = document.getElementById('cityComboBox');
            cityComboBox.innerHTML = '<option value="">Selecciona una ciudad</option>';
            if (data.data) {
                data.data.sort((a, b) => a.localeCompare(b));
                data.data.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    option.text = city;
                    cityComboBox.add(option);
                });
            }
        })
        .catch(error => console.error('Error al cargar las ciudades:', error));
    }
});

// Evento para el botón "Mostrar Información"
document.getElementById('infoButton').addEventListener('click', function() {
    const selectedCountry = document.getElementById('countryComboBox').value;
    const selectedCity = document.getElementById('cityComboBox').value;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Limpiar resultado anterior

    if (!selectedCountry) {
        resultDiv.innerHTML = '<p>Por favor, selecciona un país.</p>';
        return;
    }

    // Información del país
    fetch(`https://restcountries.com/v3.1/name/${selectedCountry}`)
        .then(response => response.json())
        .then(data => {
            const countryInfo = data[0];
            resultDiv.innerHTML += `
                <h3>Información del País</h3>
                <p><strong>Nombre:</strong> ${countryInfo.name.common}</p>
                <p><strong>Capital:</strong> ${countryInfo.capital ? countryInfo.capital[0] : 'N/A'}</p>
                <p><strong>Región:</strong> ${countryInfo.region}</p>
                <p><strong>Población:</strong> ${countryInfo.population.toLocaleString()}</p>
            `;

            // Clima de la ciudad
            const lat = countryInfo.latlng[0];
            const lon = countryInfo.latlng[1];
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
                .then(response => response.json())
                .then(weatherData => {
                    const weatherInfo = weatherData.current_weather;
                    resultDiv.innerHTML += `
                        <h3>Clima en ${selectedCity}</h3>
                        <p><strong>Temperatura:</strong> ${weatherInfo.temperature}°C</p>
                        <p><strong>Condición:</strong> ${weatherInfo.weathercode}</p>
                        <p><strong>Viento:</strong> ${weatherInfo.windspeed} km/h</p>
                    `;
                });

            // Universidades del país
            fetch(`http://universities.hipolabs.com/search?country=${selectedCountry}`)
                .then(response => response.json())
                .then(universityData => {
                    resultDiv.innerHTML += '<h3>Universidades</h3>';
                    if (universityData.length) {
                        resultDiv.innerHTML += '<ul>' + universityData.map(u => `<li>${u.name}</li>`).join('') + '</ul>';
                    } else {
                        resultDiv.innerHTML += '<p>No se encontraron universidades.</p>';
                    }
                });

            // Mostrar mapa
            const mapDiv = document.getElementById('map');

            // Reiniciar el mapa si ya ha sido inicializado
            if (mapInitialized) {
                map.remove(); // Remover el mapa anterior
            }
            
            // Crear una nueva instancia del mapa
            map = L.map(mapDiv).setView([lat, lon], 4);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Añadir marcador al mapa
            L.marker([lat, lon]).addTo(map)
                .bindPopup(`Capital: ${countryInfo.capital ? countryInfo.capital[0] : 'N/A'}`)
                .openPopup();

            mapInitialized = true; // Marcar que el mapa ha sido inicializado
        })
        .catch(error => {
            console.error('Error al obtener la información del país:', error);
            resultDiv.innerHTML = '<p>No se pudo obtener información del país.</p>';
        });
});

// Base de datos de asistencias médicas predefinida
const medicalDatabase = [
    { Año: 2023, Mes: 'Enero', 'Entidad Prestadora': 'Hospital A', Fecha: '2023-01-01', Atendidos: 150, 'Detalle de asistencia': 'Consulta general' },
    { Año: 2023, Mes: 'Febrero', 'Entidad Prestadora': 'Hospital B', Fecha: '2023-02-15', Atendidos: 200, 'Detalle de asistencia': 'Emergencia' },
    { Año: 2023, Mes: 'Marzo', 'Entidad Prestadora': 'Clínica C', Fecha: '2023-03-03', Atendidos: 50, 'Detalle de asistencia': 'Chequeo rutinario' },
    { Año: 2023, Mes: 'Abril', 'Entidad Prestadora': 'Hospital A', Fecha: '2023-04-10', Atendidos: 120, 'Detalle de asistencia': 'Consulta general' },
    { Año: 2023, Mes: 'Mayo', 'Entidad Prestadora': 'Clínica D', Fecha: '2023-05-05', Atendidos: 80, 'Detalle de asistencia': 'Cirugía ambulatoria' },
    { Año: 2023, Mes: 'Junio', 'Entidad Prestadora': 'Hospital B', Fecha: '2023-06-18', Atendidos: 220, 'Detalle de asistencia': 'Emergencia' },
    { Año: 2023, Mes: 'Julio', 'Entidad Prestadora': 'Clínica C', Fecha: '2023-07-22', Atendidos: 45, 'Detalle de asistencia': 'Chequeo rutinario' },
    { Año: 2023, Mes: 'Agosto', 'Entidad Prestadora': 'Hospital A', Fecha: '2023-08-11', Atendidos: 180, 'Detalle de asistencia': 'Consulta general' },
    { Año: 2023, Mes: 'Septiembre', 'Entidad Prestadora': 'Hospital B', Fecha: '2023-09-15', Atendidos: 210, 'Detalle de asistencia': 'Emergencia' },
    { Año: 2023, Mes: 'Octubre', 'Entidad Prestadora': 'Clínica D', Fecha: '2023-10-01', Atendidos: 90, 'Detalle de asistencia': 'Chequeo rutinario' },
    { Año: 2023, Mes: 'Noviembre', 'Entidad Prestadora': 'Hospital A', Fecha: '2023-11-10', Atendidos: 200, 'Detalle de asistencia': 'Consulta general' },
    { Año: 2023, Mes: 'Diciembre', 'Entidad Prestadora': 'Clínica C', Fecha: '2023-12-12', Atendidos: 60, 'Detalle de asistencia': 'Chequeo rutinario' },
    
    // Datos adicionales
    { Año: 2024, Mes: 'Enero', 'Entidad Prestadora': 'Hospital A', Fecha: '2024-01-15', Atendidos: 140, 'Detalle de asistencia': 'Consulta general' },
    { Año: 2024, Mes: 'Febrero', 'Entidad Prestadora': 'Clínica B', Fecha: '2024-02-20', Atendidos: 190, 'Detalle de asistencia': 'Emergencia' },
    { Año: 2024, Mes: 'Marzo', 'Entidad Prestadora': 'Hospital C', Fecha: '2024-03-05', Atendidos: 70, 'Detalle de asistencia': 'Chequeo rutinario' },
    { Año: 2024, Mes: 'Abril', 'Entidad Prestadora': 'Hospital A', Fecha: '2024-04-03', Atendidos: 160, 'Detalle de asistencia': 'Consulta general' },
    { Año: 2024, Mes: 'Mayo', 'Entidad Prestadora': 'Clínica D', Fecha: '2024-05-12', Atendidos: 85, 'Detalle de asistencia': 'Cirugía ambulatoria' },
    { Año: 2024, Mes: 'Junio', 'Entidad Prestadora': 'Hospital B', Fecha: '2024-06-18', Atendidos: 230, 'Detalle de asistencia': 'Emergencia' },
    { Año: 2024, Mes: 'Julio', 'Entidad Prestadora': 'Clínica C', Fecha: '2024-07-25', Atendidos: 40, 'Detalle de asistencia': 'Chequeo rutinario' },
    { Año: 2024, Mes: 'Agosto', 'Entidad Prestadora': 'Hospital A', Fecha: '2024-08-05', Atendidos: 180, 'Detalle de asistencia': 'Consulta general' },
    { Año: 2024, Mes: 'Septiembre', 'Entidad Prestadora': 'Hospital B', Fecha: '2024-09-10', Atendidos: 200, 'Detalle de asistencia': 'Emergencia' },
    { Año: 2024, Mes: 'Octubre', 'Entidad Prestadora': 'Clínica D', Fecha: '2024-10-22', Atendidos: 95, 'Detalle de asistencia': 'Chequeo rutinario' },
    { Año: 2024, Mes: 'Noviembre', 'Entidad Prestadora': 'Hospital A', Fecha: '2024-11-15', Atendidos: 210, 'Detalle de asistencia': 'Consulta general' },
    { Año: 2024, Mes: 'Diciembre', 'Entidad Prestadora': 'Clínica C', Fecha: '2024-12-05', Atendidos: 55, 'Detalle de asistencia': 'Chequeo rutinario' }
];


// Mostrar base de datos cuando se hace clic en el botón
document.getElementById('showDatabaseButton').addEventListener('click', function() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Limpiar resultados anteriores

    if (medicalDatabase.length === 0) {
        resultDiv.innerHTML = '<p>No hay datos disponibles en la base de datos.</p>';
        return;
    }

    // Mostrar los datos de la base de datos
    resultDiv.innerHTML = '<h3>Base de Datos de Asistencias Médicas</h3><table border="1"><thead><tr><th>Año</th><th>Mes</th><th>Entidad Prestadora</th><th>Fecha</th><th>Atendidos</th><th>Detalle de asistencia</th></tr></thead><tbody>';

    medicalDatabase.forEach(row => {
        resultDiv.innerHTML += `
            <tr>
                <td>${row.Año}</td>
                <td>${row.Mes}</td>
                <td>${row['Entidad Prestadora']}</td>
                <td>${row.Fecha}</td>
                <td>${row.Atendidos}</td>
                <td>${row['Detalle de asistencia']}</td>
            </tr>
        `;
    });

    resultDiv.innerHTML += '</tbody></table>';
});


