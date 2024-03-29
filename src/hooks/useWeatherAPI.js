import React from 'react'
import { getMoment, getSunRiseSetTime } from './../utils/helpers';

const fetchCurrentWeather = ({ authorizationKey, locationName }) => {
  return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${authorizationKey}&locationName=${locationName}`)
    
      .then((response) => response.json())
      .then((data) => {
        const locationData = data.records.location[0];
  
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, item) => {
            if (['WDSD', 'TEMP'].includes(item.elementName)) {
              neededElements[item.elementName] = item.elementValue;
            }
            return neededElements;
          },
          {}
        );
  
        return {
          observationTime: locationData.time.obsTime,
          locationName: locationData.locationName,
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
        };
      });
  };

const fetchWeatherForecast = ({ authorizationKey, cityName }) => {
  return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${authorizationKey}&locationName=${cityName}`)
  .then((response) => response.json())
  .then((data) => {
    const locationData = data.records.location[0];
    const weatherElements = locationData.weatherElement.reduce(
      (neededElements, item) => {
        if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
          neededElements[item.elementName] = item.time[0].parameter;
        }
        return neededElements;
      },
      {}
    );

    return {
      description: weatherElements.Wx.parameterName,
      weatherCode: weatherElements.Wx.parameterValue,
      rainPossibility: weatherElements.PoP.parameterName,
      comfortability: weatherElements.CI.parameterName,
    };
  });
};

const fetchSunriseAndSunsetData = ({ authorizationKey, sunriseCityName}) => {
  const now = new Date();

  const nowDate = Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replace(/\//g, "-");


  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/A-B0062-001?Authorization=${authorizationKey}&timeFrom=${nowDate}`
  )
    .then((response) => response.json())
    .then((data) => {
      const sunriseAndSunsetData = data.records.locations.location;
      console.log("sunriseAndSunsetData",sunriseAndSunsetData)
      const currentMoment = getMoment(sunriseCityName, sunriseAndSunsetData);
      const sunRiseSetTimestamp = getSunRiseSetTime(sunriseCityName, sunriseAndSunsetData);
      console.log(sunRiseSetTimestamp)
      return {
        ...sunRiseSetTimestamp,
        moment: currentMoment
      };
    })


};

export default function useWeatherAPI({ locationName, cityName, sunriseCityName, authorizationKey }) {
  const [weatherElement, setWeatherElement] = React.useState({
    observationTime: new Date(),
    locationName: '',
    temperature: 0,
    windSpeed: 0,
    description: '',
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: '',
    moment:'day',
    isLoading: true,
    sunriseTimestamp: '05:00',
    sunsetTimestamp: '17:00'
  });


  const fetchData = async () => {
    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    const [currentWeather, weatherForecast,sunriseAndSunsetData] = await Promise.all([
      fetchCurrentWeather({ authorizationKey, locationName }),
      fetchWeatherForecast({ authorizationKey, cityName }),
      fetchSunriseAndSunsetData({ authorizationKey, sunriseCityName})
    ]);

    setWeatherElement({
      ...currentWeather,
      ...weatherForecast,
      ...sunriseAndSunsetData,
      isLoading: false,
    });
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return [weatherElement, fetchData];

};

