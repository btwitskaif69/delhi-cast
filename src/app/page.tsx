'use client'
import Container from "@/components/Container";
import Navbar from "@/components/Navbar";
import WeatherIcon from "@/components/WeatherIcon";
import { convertKelvinToCelsius } from "@/utils/convertKelvinToCelsius";
import { getDayOrNightIcon } from "@/utils/getDayOrNightIcon";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { da } from "date-fns/locale";


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
  const { isLoading, error, data } = useQuery<WeatherData>({
    queryKey: ['repoData'],
    queryFn: async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=Delhi&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&units=metric`
      );
      return data;
    },
  });
  
  const firstdata = data?.list[0];

    console.log("data", data);

  if (isLoading)
    return (
  <div className="flex items-center min-h-screen justify-center">
    <p className="animate-bounce">Loading...</p>
  </div>
    );

  return (
    <div className="flex flex-col gap-4 bg-grey-100 min-h-screen">
      <Navbar />
      <main className="px-3 mx-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {/* Today Data */}
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

        </section>
        {/* 7 Day Forcast Data */}
        <section>

        </section>
      </main>
    </div>
  );
}
