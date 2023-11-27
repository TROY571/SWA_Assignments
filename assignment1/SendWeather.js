const uri = 'http://localhost:8080/data'

const back = () =>
{
    window.location.href = 'Index.html'
}

const sendData = () =>
{
    const place = document.getElementById('place')
    const time = document.getElementById('time')
    const temp = document.getElementById('temp')
    const precipitationType = document.getElementById('precipitationType')
    const precipitation = document.getElementById('precipitation')
    const windDirection = document.getElementById('windDirection')
    const windSpeed = document.getElementById('windSpeed')
    const cloudCoverage = document.getElementById('cloudCoverage')
    
    const data = 
        [{"type": "temperature",
        "time": time,
        "place": place,
        "value": temp,
        "unit": "C"},
        {"type": "precipitation",
            "time": time,
            "place": place,
            "value": precipitation,
            "unit": "mm",
            "precipitation_type":precipitationType},
        {"type": "wind speed",
            "time": time,
            "place": place,
            "value": windSpeed,
            "unit": "m/s",
            "direction": windDirection},
        {"type": "cloud coverage",
            "time": time,
            "place": place,
            "value": cloudCoverage,
            "unit": "%"}]
    
    sendRequest(data)
}
    
const sendRequest = (data) =>
{
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' }
    fetch(uri,
        {
            method: 'post',
            body: JSON.stringify(data),
            headers
        })
        .then(res => 
        {
            if (res.ok)
                return res
            else
                return Promise.reject(res.statusText)
        })
}