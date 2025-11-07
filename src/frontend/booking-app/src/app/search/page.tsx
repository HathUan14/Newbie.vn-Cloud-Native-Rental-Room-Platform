"use client";

import FilterBar from "@/components/FilterBar";
import RoomInfo, { RoomProps } from "@/components/RoomInfo";
import SwithPage from "@/components/SwitchPage";
import { useState } from "react";

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
    // Todo: Call API
  };

  const handleSwitchPage = (pageIndex: number) => {
    console.log(pageIndex);

    // Todo: Call API
  };
  return (
    <div className="flex flex-col md:flex-row justify-center items-start gap-2.5 mb-12">
      <FilterBar
        onFilter={(filter) => handleFilter(filter)}
        className={`flex flex-row md:flex-col justify-center items-center `}
      ></FilterBar>

      <div className="flex flex-col gap-10 w-fit max-w-4xl">
        <div className="flex flex-col gap-5 w-fit">
          <RoomInfo room={room}></RoomInfo>
          <RoomInfo room={room}></RoomInfo>
          <RoomInfo room={room}></RoomInfo>
          <RoomInfo room={room}></RoomInfo>
          <RoomInfo room={room}></RoomInfo>
          <RoomInfo room={room}></RoomInfo>
          <RoomInfo room={room}></RoomInfo>
          <RoomInfo room={room}></RoomInfo>
          <RoomInfo room={room}></RoomInfo>
          <RoomInfo room={room}></RoomInfo>
        </div>
        <SwithPage
          className="w-full max-w-4xl"
          maxPage={45}
          onSwitch={(index) => handleSwitchPage(index)}
        ></SwithPage>
      </div>
    </div>
  );
}

export default SearchPage;
