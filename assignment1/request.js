const uri = 'http://localhost:8080/'

const init = (place) =>
{
    getForecastData(place)
    getRecentData(place)
}

const getForecastData = (place) => 
{
    let times = []
    let temperatures = []
    let weathers = []
    let precipitations = []
    let windSpeeds = []
    let cloudCoverages = []
    for (let i = 0; i < 24; i++)
    {
        let time = document.getElementById('time' + i)
        let temperature = document.getElementById('temperature' + i)
        let weather = document.getElementById('weather' + i)
        let precipitation = document.getElementById('precipitation' + i)
        let windSpeed = document.getElementById('wind speed' + i)
        let cloudCoverage = document.getElementById('cloud coverage' + i)
        
        times.push(time)
        temperatures.push(temperature)
        weathers.push(weather)
        precipitations.push(precipitation)
        windSpeeds.push(windSpeed)
        cloudCoverages.push(cloudCoverage)
    }
    
    const xhr = new XMLHttpRequest()
    xhr.open('get', `${uri}forecast/${place}`, true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.send()
    xhr.onreadystatechange = () => 
    {
        //console.log(xhr.responseText)
        const data = xhr.responseText
        const json = JSON.parse(data)
        //console.log(json)
        
        for (let i = 0; i < 24; i++)
        {
            times[i].innerHTML = 'Time:' + json[i*4].time
            temperatures[i].innerHTML = 'Temperature: from ' + json[i*4].from + json[i*4].unit + ' to ' + json[i*4].to + json[i*4].unit
            weathers[i].innerHTML = 'Weather: ' + json[i*4+1].precipitation_types
            precipitations[i].innerHTML = 'Precipitation: from ' + json[i*4+1].from + json[i*4+1].unit + ' to ' + json[i*4+1].to + json[i*4+1].unit
            windSpeeds[i].innerHTML = 'Wind speed: from ' + json[i*4+2].from + json[i*4+2].unit + ' to ' + json[i*4+2].to + json[i*4+2].unit
            cloudCoverages[i].innerHTML = 'Cloud coverage: from ' + json[i*4+3].from + json[i*4+3].unit + ' to ' + json[i*4+3].to + json[i*4+3].unit
        }
    }
}

const getRecentData = (place) =>
{
    let temperature = document.getElementById('temperatureR')
    let weather = document.getElementById('weatherR')
    let precipitation = document.getElementById('precipitationR')
    let windSpeed = document.getElementById('wind speedR')
    let cloudCoverage = document.getElementById('cloud coverageR')

    const xhr = new XMLHttpRequest()
    xhr.open('get', `${uri}data/${place}`, true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.send()
    xhr.onreadystatechange = () =>
    {
        console.log(xhr.responseText)
        const data = xhr.responseText
        const json = JSON.parse(data)
        console.log(json)

        //recent measurement
        temperature.innerHTML = 'Temperature: ' + json[668].value + json[668].unit
        weather.innerHTML = 'Weather: ' + json[669].precipitation_type
        precipitation.innerHTML = 'Precipitation: ' + json[669].value + json[669].unit
        windSpeed.innerHTML = 'Wind speed: ' + json[670].value + json[670].unit
        cloudCoverage.innerHTML = 'Cloud coverage: ' + json[671].value + json[671].unit
        
        //last day data
        const Temperatures = []
        const precipitations = []
        const windSpeeds = []
        json.forEach(function (item, index)
        {
            if (index > 583)
            {
                //console.log(item, index)
                switch (item.type)
                {
                    case 'temperature':
                        Temperatures.push(item.value)
                        break
                    case 'precipitation':
                        precipitations.push(item.value)
                        break
                    case 'wind speed':
                        windSpeeds.push(item.value)
                        break
                }
            }
        })
        console.log(Temperatures)
        console.log(precipitations)
        console.log(windSpeeds)
        
        let minTemp = document.getElementById('minimumTemp')
        let maxTemp = document.getElementById('maximumTemp')
        let totalPrecipitation = document.getElementById('totalPrecipitation')
        let avgWindSpd = document.getElementById('avgWindSpd')
        
        minTemp.innerHTML = 'Minimum temperature: ' + Math.min.apply(Math, Temperatures) + 'C'
        maxTemp.innerHTML = 'Maximum temperature: ' + Math.max.apply(Math, Temperatures) + 'C'
        const sum = (array) =>
        {
            return eval(array.join("+"))
        }
        totalPrecipitation.innerHTML = 'Total precipitation: ' + sum(precipitations).toFixed(1) + 'mm'
        const avgWS = sum(windSpeeds)/windSpeeds.length
        avgWindSpd.innerHTML = 'Average wind speed: ' + avgWS.toFixed(1) + 'm/s'

    }
}

const send = () =>
{
    window.location.href = 'SendWeather.html'
}