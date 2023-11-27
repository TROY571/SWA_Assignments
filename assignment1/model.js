const event = (time, place) => 
{
    const getTime = () => time
    const getPlace = () => place
    return {getTime, getPlace}
}

const WeatherData = (value, type, unit, time, place) => 
{
    const getValue = () => value
    const getType = () => type
    const getUnit = () => unit
    let e = event(time, place)
    return{getValue, getType, getUnit, ...e}
}

const Temperature = (f, c, value, type, unit, time, place) => 
{
    const convertToF = () => f
    const convertToC = () => c
    let w = WeatherData(value, type, unit, time, place)
    return{convertToF, convertToC, ...w}
}

const Precipitation = (pType, inches, mm, value, type, unit, time, place) => 
{
    const getPrecipitationType = () => pType
    const convertToInches = () => inches
    const convertToMM = () => mm
    let w = WeatherData(value, type, unit, time, place)
    return{getPrecipitationType, convertToInches, convertToMM, ...w}
}

const Wind = (direction, mph, ms, value, type, unit, time, place) => 
{
    const getDirection = () => direction
    const convertToMPH = () => mph
    const convertToMS = () => ms
    let w = WeatherData(value, type, unit, time, place)
    return{getDirection, convertToMPH, convertToMS, ...w}
}

const CloudCoverage = (value, type, unit, time, place) => 
{

    let w = WeatherData(value, type, unit, time, place)
    return{...w}
}

const WeatherPrediction = (max, min, type, unit, time, place) => 
{
    const getMax = () => max
    const getMin = () => min
    const getType = () => type
    const getUnit = () => unit
    let e = event(time, place)
    return{getMax, getMin, getType, getUnit, ...e}
}

const TemperaturePrediction = (f, c, max, min, type, unit, time, place) => 
{
    const convertToF = () => f
    const convertToC = () => c
    let w = WeatherPrediction(max, min, type, unit, time, place)
    return{convertToF, convertToC, ...w}
}

const PrecipitationPrediction = (exTypes, inches, mm, max, min, type, unit, time, place) => 
{
    const getExpectedTypes = () => exTypes
    const convertToInches = () => inches
    const convertToMM = () => mm
    let w = WeatherPrediction(max, min, type, unit, time, place)
    return{getExpectedTypes, convertToInches, convertToMM, ...w}
}

const WindPrediction = (exDirection, mph, ms, max, min, type, unit, time, place) => 
{
    const getExpectedDirections = () => exDirection
    const convertToMPH = () => mph
    const convertToMS = () => ms
    let w = WeatherPrediction(max, min, type, unit, time, place)
    return{getExpectedDirections, convertToMPH, convertToMS, ...w}
}

const CloudCoveragePrediction = (max, min, type, unit, time, place) => 
{
    let w = WeatherPrediction(max, min, type, unit, time, place)
    return{...w}
}

/*
let test = weatherData(1,2,3,4,5)
console.log(test.getPlace())
*/
