"use client";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import parseToArray from "@/utils/parseToArray";

interface Feature {
	id: string;
	bbox: [];
	datetime: string;
	instrument: [];
	platform: string;
	area_m2: number;
}

type SheetProps = {
	type: string;
	showData: boolean;
	toggleDataSheet: () => void;
	featureId: string;
};

export default function DataSheet({
	type,
	showData,
	toggleDataSheet,
	featureId,
}: SheetProps) {
	const [feature, setFeature] = useState<Feature>();
	const [isLoading, setIsLoading] = useState<boolean>(true);

	async function getFeatureMetrics() {
		const params = new URLSearchParams({
			type,
		});
		const res = await fetch(
			`http://localhost:3000/features/${featureId}/metrics?${params.toString()}`
		);
		let featureData = await res.json();
		featureData.bbox = parseToArray(featureData?.bbox);
		setFeature(featureData);
		setIsLoading(false);
	}

	useEffect(() => {
		if (showData) getFeatureMetrics();
	}, []);

	return (
		<>
			<Sheet open={showData} onOpenChange={toggleDataSheet}>
				<SheetContent side="left">
					<SheetHeader>
						<SheetTitle>Feature Metric Data</SheetTitle>
						<SheetDescription>Here are the metric data.</SheetDescription>
					</SheetHeader>
					<ul className="px-5">
						<li className="mb-4">
							<strong>ID:</strong>
							<div className="mt-2 overflow-auto text-sm bg-gray-600 text-white p-2 border-2 border-green-800">
								{featureId}
							</div>
						</li>
						<li className="mb-4">
							<strong>Bounding Box:</strong>
							{isLoading ? (
								<Skeleton className="mt-2 h-[20px] w-full rounded-none" />
							) : (
								<div className="mt-2 overflow-auto text-sm bg-gray-600 text-white p-2 border-2 border-green-800">
									{feature?.bbox.map((n, i) => (
										<div key={i}>{n}</div>
									))}
								</div>
							)}
						</li>
						<li className="mb-4">
							<strong>Area:</strong>
							{isLoading ? (
								<Skeleton className="mt-2 h-[20px] w-full rounded-none" />
							) : (
								<div className="mt-2 overflow-auto text-sm bg-gray-600 text-white p-2 border-2 border-green-800">
									{feature?.area_m2}
								</div>
							)}
						</li>
						<li className="mb-4">
							<strong>Platform:</strong>
							{isLoading ? (
								<Skeleton className="mt-2 h-[20px] w-full rounded-none" />
							) : (
								<div className="mt-2 overflow-auto text-sm bg-gray-600 text-white p-2 border-2 border-green-800">
									{feature?.platform}
								</div>
							)}
						</li>
						<li className="mb-4">
							<strong>Date/Time:</strong>
							{isLoading ? (
								<Skeleton className="mt-2 h-[20px] w-full rounded-none" />
							) : (
								<div className="mt-2 overflow-auto text-sm bg-gray-600 text-white p-2 border-2 border-green-800">
									{feature?.datetime}
								</div>
							)}
						</li>
					</ul>
				</SheetContent>
			</Sheet>
		</>
	);
}
