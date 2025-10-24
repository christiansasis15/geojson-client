"use client";
import { CalendarIcon, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { format } from "date-fns";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "./ui/calendar";
import { formatDate } from "@/utils/formatDate";
import { useState } from "react";

const formSchema = z.object({
	category: z.string(),
	type: z.string(),
	bbox: z.string().min(2),
	dateFrom: z.date(),
	dateTo: z.date(),
});

type FilterValue = {
	category: string;
	type: string;
	bbox: string;
	datetime: string;
	changeValue: (
		category: string,
		type: string,
		bbox: string,
		datetime: string
	) => void;
};

export const SENTINEL_CATEGORIES = [
	{
		id: "sentinel1",
		name: "Sentinel-1",
		description: "SAR (Synthetic Aperture Radar)",
		types: [
			{
				id: "sentinel-1-grd",
				name: "GRD - Ground Range Detected",
				value: "grd",
			},
		],
	},
	{
		id: "sentinel2",
		name: "Sentinel-2",
		description: "Optical Multispectral Imagery",
		types: [
			{ id: "sentinel-2-l1c", name: "L1C - Top-of-atmosphere", value: "l1c" },
			{
				id: "sentinel-2-l2a",
				name: "L2A - Bottom-of-atmosphere",
				value: "l2a",
			},
		],
	},
	{
		id: "sentinel3",
		name: "Sentinel-3",
		description: "Ocean and Land Monitoring",
		types: [
			{
				id: "sentinel-3-olci",
				name: "OLCI - Ocean and Land Colour",
				value: "olci",
			},
			{
				id: "sentinel-3-slstr",
				name: "SLSTR - Sea and Land Temperature",
				value: "slstr",
			},
		],
	},
	{
		id: "sentinel5p",
		name: "Sentinel-5P",
		description: "Atmospheric Monitoring",
		types: [
			{
				id: "sentinel-5p-l2",
				name: "L2 - Atmospheric Composition",
				value: "l2",
			},
		],
	},
	{
		id: "landsat",
		name: "Landsat",
		description: "Landsat 5-9 Missions",
		types: [
			{
				id: "landsat-ot-l1",
				name: "OT L1 - Landsat 8-9 Level-1",
				value: "ot-l1",
			},
			{
				id: "landsat-ot-l2",
				name: "OT L2 - Landsat 8-9 Level-2",
				value: "ot-l2",
			},
			{
				id: "landsat-tm-l1",
				name: "TM L1 - Landsat 4-5 Level-1",
				value: "tm-l1",
			},
			{
				id: "landsat-tm-l2",
				name: "TM L2 - Landsat 4-5 Level-2",
				value: "tm-l2",
			},
			{
				id: "landsat-etm-l1",
				name: "ETM L1 - Landsat 7 Level-1",
				value: "etm-l1",
			},
			{
				id: "landsat-etm-l2",
				name: "ETM L2 - Landsat 7 Level-2",
				value: "etm-l2",
			},
		],
	},
	{
		id: "modis",
		name: "MODIS",
		description: "Terra/Aqua MODIS",
		types: [{ id: "modis", name: "MODIS Standard", value: "modis" }],
	},
	{
		id: "dem",
		name: "DEM",
		description: "Digital Elevation Models",
		types: [
			{ id: "dem", name: "DEM Standard", value: "dem" },
			{ id: "cop-dem-glo-30", name: "Copernicus DEM 30m", value: "cop-dem-30" },
			{ id: "cop-dem-glo-90", name: "Copernicus DEM 90m", value: "cop-dem-90" },
		],
	},
];

export default function FilterMap({
	category,
	type,
	bbox,
	datetime,
	changeValue,
}: FilterValue) {
	const [selectedCategory, setSelectedCategory] = useState<string>(category);
	const [open, setOpen] = useState<boolean>(true);
	const availableTypes = selectedCategory
		? SENTINEL_CATEGORIES.find((cat) => cat.id === selectedCategory)?.types ||
		  []
		: [];

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			category: category,
			type: type,
			bbox: bbox,
			dateFrom: new Date(),
			dateTo: new Date(),
		},
	});
	function onSubmit(values: z.infer<typeof formSchema>) {
		const formatDateFrom = formatDate(values.dateFrom);
		const formatDateTo = formatDate(values.dateTo);
		const dateTimeFormat = formatDateFrom + "/" + formatDateTo;
		console.log(values);
		changeValue(values.category, values.type, values.bbox, dateTimeFormat);
	}
	return (
		<>
			<div className="py-2 text-right absolute top-0 right-2 z-50">
				<Popover open={open}>
					<PopoverTrigger asChild>
						<Button
							onClick={() => {
								open ? setOpen(false) : setOpen(true);
							}}
						>
							<Filter />
							Filter
						</Button>
					</PopoverTrigger>
					<PopoverContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-8"
							>
								<FormField
									control={form.control}
									name="category"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Category</FormLabel>
											<FormControl>
												<Select
													onValueChange={(value) => {
														field.onChange(value);
														setSelectedCategory(value);
													}}
													defaultValue={field.value}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Choose Category" />
													</SelectTrigger>
													<SelectContent>
														{SENTINEL_CATEGORIES.map((category, index) => (
															<SelectItem key={index} value={category.id}>
																{category.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="type"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Type</FormLabel>
											<FormControl>
												<Select
													onValueChange={(value) => {
														field.onChange(value);
													}}
													defaultValue={field.value}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Choose Types" />
													</SelectTrigger>
													<SelectContent>
														{availableTypes.map((type, index) => (
															<SelectItem value={type.id} key={index}>
																{type.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="bbox"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Bounding Box</FormLabel>
											<FormControl>
												<Input placeholder="ex. 13, 45, 14, 46" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="dateFrom"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Date From</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button variant={"outline"}>
															{field.value ? (
																format(field.value, "PPP")
															) : (
																<span>Pick a date</span>
															)}
															<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														disabled={(date) =>
															date > new Date() || date < new Date("1900-01-01")
														}
														captionLayout="dropdown"
													/>
												</PopoverContent>
											</Popover>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="dateTo"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Date To</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button variant={"outline"}>
															{field.value ? (
																format(field.value, "PPP")
															) : (
																<span>Pick a date</span>
															)}
															<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														disabled={(date) =>
															date > new Date() || date < new Date("1900-01-01")
														}
														captionLayout="dropdown"
													/>
												</PopoverContent>
											</Popover>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit">Submit</Button>
							</form>
						</Form>
					</PopoverContent>
				</Popover>
			</div>
		</>
	);
}
