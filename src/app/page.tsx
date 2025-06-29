'use client'
import Container from "@/components/Container";
import ForecastWeatherDetail from "@/components/ForecastWeatherDetail";
import Navbar from "@/components/Navbar";
import WeatherDetails from "@/components/WeatherDetails";
import WeatherIcon from "@/components/WeatherIcon";
import { convertKelvinToCelsius } from "@/utils/convertKelvinToCelsius";
import { getDayOrNightIcon } from "@/utils/getDayOrNightIcon";
import { metersToKilometers } from "@/utils/metersToKilometers";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import { da } from "date-fns/locale";
import { convertWindSpeed } from "@/utils/convertWindSpeed";
import { loadingCityAtom, placeAtom } from "./atom";
import { useAtom } from "jotai";
import { useEffect } from "react";


interface WeatherDetail {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherDetail[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export default function Home() {
  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity] = useAtom(loadingCityAtom);
  const { isLoading, error, data, refetch } = useQuery<WeatherData>({
    queryKey: ['repoData'],
    queryFn: async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&units=metric`
      );
      return data;
    },
  });

  useEffect(() => {
    refetch();
  }, [place, refetch]);
  
  const firstdata = data?.list[0];

    console.log("data", data);

  if (isLoading)
    return (
  <div className="flex items-center min-h-screen justify-center">
    <p className="animate-bounce">Loading...</p>
  </div>
    );

  // function convertWindSpeed(arg0: any) {
  //   throw new Error("Function not implemented.");
  // }

    // Get unique dates from the weather data list
  const uniqueDates = Array.from(
    new Set(
      data?.list.map((entry) =>
        new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  );

    // Filtering data to get the first entry after 6 AM for each unique date
  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });

  if (isLoading)
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center min-h-screen justify-center">
        {/* @ts-ignore */}
        <p className="text-red-400">{error.message}</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 bg-grey-100 min-h-screen">
      <Navbar location={data?.city.name}/>
      <main className="px-3 mx-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {/* Today Data */}
         {loadingCity ? (
          <WeatherSkeleton />
        ) : (
          <>
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="flex gap-1 text-2xl items-end">
              <p className="2xl">{format(parseISO(firstdata?.dt_txt ?? ""), "EEEE")}</p>
              <p className="text-lg">{format(parseISO(firstdata?.dt_txt ?? ""), "dd-MM-yyyy")}</p>
            </h2>
            <Container className="gap-10 px-6 items-center">
              <div className="flex flex-col px-4 items-center">
               <span className="text-5xl">
                {firstdata ? Math.round(firstdata.main.temp) : 20}°
               </span>
               <p className="text-xs space-x-1 whitespace-nowrap">
                <span>Feels Like</span>
                <span>
                  {firstdata ? Math.round(firstdata.main.feels_like) : 0}°
                </span>
               </p>
               <p className="text-xs space-x-2 whitespace-nowrap">
                <span>
                  {firstdata ? Math.round(firstdata.main.temp_min) : 0}°↓
                </span>
                <span>
                  {firstdata ? Math.round(firstdata.main.temp_max) : 0}°↑
                </span>
               </p>
              </div>
              {/* Time & Weather Icons */}
              <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                {data?.list.map((item) => (
                  <div key={item.dt} className="flex flex-col justify-between gap-2 items-center font-semibold">
                    <p className="text-xs whitespace-nowrap">
                      {format(parseISO(item.dt_txt), "hh:mm aa")}
                    </p>
                    <WeatherIcon iconName={getDayOrNightIcon(item.weather[0].icon, item.dt_txt)} />
                    <p>
                      {firstdata ? Math.round(item.main.temp) : 0}°
                    </p>
              </div>
                ))}
              </div>
            </Container>
          </div>
          <div className="flex gap-4">
            {/* Left */}
            <Container className="w-fit justify-center flex-col px-4 items-center">
              <p className="capitalize text-center">
                {firstdata?.weather[0].description}
              </p>
              <WeatherIcon 
              iconName={getDayOrNightIcon(firstdata?.weather[0].icon ?? "01d", firstdata?.dt_txt ?? "")} />
            </Container>

            <Container className="bg-yellow-300/80 px-4 gap-6 justify-between overflow-x-auto"> 
            <WeatherDetails
              visability={metersToKilometers(firstdata?.visibility ?? 1000)}
              airPressure={`${firstdata?.main.pressure ?? 1012} hPa`}
              humidity={`${firstdata?.main.humidity ?? 0}%`}
              windSpeed={`${firstdata?.wind.speed ?? 0} km/h`}
              sunrise={
                data?.city.sunrise
                  ? format(new Date(data.city.sunrise * 1000), "hh:mm aa")
                  : "--:--"
              }
              sunset={
                data?.city.sunset
                  ? format(new Date(data.city.sunset * 1000), "hh:mm aa")
                  : "--:--"
              }
            />
            </Container>
            {/* Right */}
          </div>
        </section>
        {/* 7 Day Forcast Data */}
        <section className="flex w-full flex-col gap-4  ">
              <p className="text-2xl">Forcast (7 days)</p>
              {firstDataForEachDate.map((d, i) => (
                <ForecastWeatherDetail
                  key={i}
                  description={d?.weather[0].description ?? ""}
                  weatehrIcon={d?.weather[0].icon ?? "01d"}
                  date={d ? format(parseISO(d.dt_txt), "dd.MM") : ""}
                  day={d ? format(parseISO(d.dt_txt), "EEEE") : ""}
                  temp={d ? Math.round(d.main.temp) : 0}
                  feels_like={d ? Math.round(d.main.feels_like) : 0}
                  temp_max={d ? Math.round(d.main.temp_max) : 0}
                  temp_min={d ? Math.round(d.main.temp_min) : 0}
                  airPressure={`${d?.main.pressure} hPa `}
                  humidity={`${d?.main.humidity}% `}
                  sunrise={format(
                    fromUnixTime(data?.city.sunrise ?? 1702517657),
                    "H:mm"
                  )}
                  sunset={format(
                    fromUnixTime(data?.city.sunset ?? 1702517657),
                    "H:mm"
                  )}
                  visability={`${metersToKilometers(d?.visibility ?? 10000)} `}
                  windSpeed={`${convertWindSpeed(d?.wind.speed ?? 1.64)} `}
                />
              ))}
            </section>
            </>
        )}
      </main>
    </div>
  );
}


function WeatherSkeleton() {
  return (
    <section className="space-y-8 ">
      {/* Today's data skeleton */}
      <div className="space-y-2 animate-pulse">
        {/* Date skeleton */}
        <div className="flex gap-1 text-2xl items-end ">
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
        </div>

        {/* Time wise temperature skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
              <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 7 days forecast skeleton */}
      <div className="flex flex-col gap-4 animate-pulse">
        <p className="text-2xl h-8 w-36 bg-gray-300 rounded"></p>

        {[1, 2, 3, 4, 5, 6, 7].map((index) => (
          <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    </section>
  );
}