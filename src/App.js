import React from 'react'
import styled from '@emotion/styled'
import {ThemeProvider} from '@emotion/react';
import WeatherCard from './views/WeatherCard'
import WeatherSetting from './views/WeatherSetting';
import useWeatherAPI from './hooks/useWeatherAPI';
import {findLocation} from './utils/helpers';

const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AUTHORIZATION_KEY = 'CWB-9D18526C-918A-4CF6-8EB0-A8FA11E9A0F2'

function App() {
  const storageCity = localStorage.getItem('cityName') || '臺北市';

  const [currentPage, setCurrentPage] = React.useState('WeatherCard')
  const [currentCity, setCurrentCity] = React.useState(storageCity)
  const currentLocation = React.useMemo(() => findLocation(currentCity), [
    currentCity])
  const { cityName, locationName, sunriseCityName } = currentLocation;
  const [currentTheme, setCurrentTheme] = React.useState('light')
  const [weatherElement, fetchData] = useWeatherAPI({
    locationName,
    cityName,
    sunriseCityName,
    authorizationKey: AUTHORIZATION_KEY,
  });


console.log(cityName)

  /*const {
    moment
  } = weatherElement*/

  const handleCurrentPageChange = (currentPage) => {
    setCurrentPage(currentPage);
  };
  const handleCurrentCityChange = (currentCity) => {
    setCurrentCity(currentCity);
  };
  React.useEffect(() => {
    setCurrentTheme(weatherElement.moment === 'day' ? 'light' : 'dark');
  }, [weatherElement.moment]);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {currentPage === 'WeatherCard' && (
            <WeatherCard
              cityName={cityName}
              weatherElement={weatherElement}
              moment={weatherElement.moment}
              fetchData={fetchData}
              handleCurrentPageChange={handleCurrentPageChange}
            />
        )}

        {currentPage === 'WeatherSetting' && <WeatherSetting cityName={cityName} handleCurrentPageChange={handleCurrentPageChange} handleCurrentCityChange={handleCurrentCityChange}/>}
      </Container>
    </ThemeProvider>
  );
}

export default App;

