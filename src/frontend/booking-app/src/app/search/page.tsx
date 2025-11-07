"use client";

import FilterBar from "@/components/FilterBar";
import RoomInfo, { RoomProps } from "@/components/RoomInfo";

function SearchPage() {
  const room: RoomProps = {
    title: "titile",
    price: 123,
    guestCapacity: 2,
    addressStreet: "24w",
    ward: "2134",
    district: "2345",
    city: "1245",
    imageUrl: "room-image-1.jpg",
  };

  const handleFilter = (filter = {}) => {
    console.log(filter);
  };
  return (
    <div className="flex flex-row justify-center items-center">
      <div className=" sticky">
        <FilterBar
          onFilter={(filter) => handleFilter(filter)}
          className={`flex flex-col items-center justify-center `}
        ></FilterBar>
      </div>
      <div>
        <RoomInfo room={room}></RoomInfo>
      </div>
    </div>
  );
}

export default SearchPage;
