"use client";
import FilterMap from "@/components/FilterMap";
import MapSection from "@/components/Map";
import { useState } from "react";

interface FilterValue {
	category: string;
	type: string;
	bbox: string;
	datetime: string;
}

export default function Home() {
	const defaultValues = {
		category: "sentinel2",
		type: "sentinel-2-l1c",
		bbox: "13,45,14,46",
		datetime: "2019-12-10T00:00:00Z/2019-12-11T00:00:00Z",
	};
	const [queryFilter, setQueryFilter] = useState<FilterValue>(defaultValues);
	const [isFilterChanged, setIsFilterChanged] = useState<boolean>(true);

	const changeValue = (
		newCategory: string,
		newType: string,
		newBbox: string,
		newDateTime: string
	) => {
		setIsFilterChanged(true);
		const newFilterValues = {
			category: newCategory,
			type: newType,
			bbox: newBbox,
			datetime: newDateTime,
		};
		setQueryFilter(newFilterValues);
	};

	const toggleChanges = () => {
		if (isFilterChanged) return true;
		else return false;
	};

	return (
		<div className="w-full">
			<div className="relative">
				<FilterMap
					category={queryFilter.category}
					type={queryFilter.type}
					bbox={queryFilter.bbox}
					datetime={queryFilter.datetime}
					changeValue={changeValue}
				/>
				<MapSection
					type={queryFilter.type}
					bbox={queryFilter.bbox}
					datetime={queryFilter.datetime}
					toggleChanges={toggleChanges}
				/>
			</div>
		</div>
	);
}
