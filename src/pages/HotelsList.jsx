import { useContext, useEffect, useState } from "react";
import { MainContext } from "../context/MainContext";
import { Footer, HotelCard, Navbar } from "../components";
import { getPlacesByLatLng } from "../api";
import { PlaceListLoader } from "../components/loaders";
import map from "../img/map.png";
import moment from "moment";
import axios from "axios";
import { useHistory } from "react-router-dom";

// Custom Input Field Component
const Input = ({
  type,
  name,
  value,
  valueInline,
  handleChange,
  handleChangeInline,
  classProps,
  moreProps,
}) => (
  <input
    type={type}
    name={name}
    value={valueInline ? valueInline : value[name]}
    onChange={
      handleChangeInline ? handleChangeInline : (e) => handleChange(e, name)
    }
    className={classProps}
    {...moreProps}
  />
);

const HotelsList = () => {
  const { coordinates, isLoading, setIsLoading, setType } =
    useContext(MainContext);
  const [hotels, setHotels] = useState();
  const history = useHistory();
  const [maxDistance, setMaxDistance] = useState(null);
  const [searchCount, setSearchCount] = useState(0);

  const [filterParams, setFilterParams] = useState({
    limit: 30,
    rooms: 1,
    adults: 2,
    hotel_class: "4, 5",
    checkin: moment(new Date()).format("YYYY-MM-DD"),
    checkout: moment(new Date()).format("YYYY-MM-DD"),
    nights: 1,
    pricesmax: "",
    pricesmin: "",
  });

  const handleChange = (e, name) => {
    setFilterParams((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  useEffect(() => {
    let isMounted = true;
    let source = axios.CancelToken.source();

    setIsLoading(true);

    getPlacesByLatLng(
      "hotels",
      coordinates.lat,
      coordinates.lng,
      { ...filterParams },
      source
    )
      .then((data) => {
        if (isMounted) {
          let tmpState = data.filter((hotel) => hotel.name);
          // Filter distance
          if (maxDistance != null && maxDistance > 0) {
            tmpState = tmpState.filter(
              (item) => item.distance <= maxDistance / 1000
            );
          }
          setHotels(tmpState);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setIsLoading(false);
          console.error(err);
        }
      });

    return () => {
      isMounted = false;
      source.cancel();
    };
  }, [coordinates, filterParams, searchCount]);

  return (
    <>
      <Navbar border />
      <div className="pb-4">
        <div className="container mx-auto text-center my-10">
          <h1 className="font-semibold text-lg md:text-3xl">
            Hotels and Places to stay
          </h1>
        </div>

        {/* Filters Section */}
        <div className="container mx-auto">
          <div className="grid grid-cols-10 gap-2 items-center px-4 py-5">
            {/* Check In */}
            <div className="col-span-3 relative">
              <span className="absolute text-xs bg-white font-semibold px-2 -top-2 left-2">
                Check In
              </span>
              <Input
                type="date"
                name="checkin"
                value={filterParams}
                handleChangeInline={(e) =>
                  setFilterParams((prevState) => ({
                    ...prevState,
                    checkin: e.target.value,
                    nights: Number(
                      moment(new Date(filterParams.checkout)).diff(
                        moment(new Date(e.target.value)),
                        "days"
                      )
                    ),
                  }))
                }
                moreProps={{
                  min: filterParams.checkin,
                  max: filterParams.checkout,
                }}
                classProps="w-full rounded border-y border-r shadow px-4 py-2 border-l-8 border-l-green-600 focus:text-gray-700 focus:bg-white focus:border-green-600 focus:outline-none"
              />
            </div>

            {/* Check Out */}
            <div className="col-span-3 relative">
              <span className="absolute text-xs bg-white font-semibold px-2 -top-2 left-2">
                Check Out
              </span>
              <Input
                type="date"
                name="checkout"
                value={filterParams}
                handleChangeInline={(e) =>
                  setFilterParams((prevState) => ({
                    ...prevState,
                    checkout: e.target.value,
                    nights: Number(
                      moment(new Date(e.target.value)).diff(
                        filterParams.checkin,
                        "days"
                      )
                    ),
                  }))
                }
                moreProps={{ min: filterParams.checkin }}
                classProps="w-full rounded border-y border-r shadow px-4 py-2 border-l-8 border-l-red-600 focus:text-gray-700 focus:bg-white focus:border-red-600 focus:outline-none"
              />
            </div>

            {/* Distance */}
            <div className="col-span-3 relative">
              <span className="absolute text-xs bg-white font-semibold px-2 -top-2 left-2">
                Distance (m)
              </span>
              <input
                type="number"
                name="maxDistance"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="w-full rounded border-y border-r shadow px-4 py-2 border-l-8 border-l-blue-600 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            {/* Search Button */}
            <div className="col-span-1">
              <button
                className="w-full h-full rounded bg-blue-600 text-white font-bold shadow py-2 px-4 hover:bg-blue-700"
                onClick={() => {
                  setSearchCount(searchCount + 1);
                }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
        {/* /Filters Section */}

        <div className="container mx-auto px-4 lg:grid lg:grid-cols-12 gap-2">
          <div className="lg:col-span-3">
            <div className="w-full border shadow mt-2 p-2">
              <div className="relative">
                <img
                  src={map}
                  alt="Map"
                  className="w-full h-20 lg:h-full object-cover"
                />
                <div className="absolute w-full h-full top-0 flex items-center justify-center">
                  <button
                    className="bg-white rounded-sm border border-black py-2 px-4 hover:bg-black hover:text-white"
                    onClick={() => {
                      setType("hotels");
                      history.push("/map");
                    }}
                  >
                    <p className="font-semibold flex items-center text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      View On Map
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            {!hotels || isLoading ? (
              <PlaceListLoader />
            ) : (
              hotels?.map((hotel, i) => <HotelCard key={i} hotel={hotel} />)
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HotelsList;
