import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";
import { DialogTrigger } from "react-aria-components";
import DismissibleCard from "../DismissibleCard";
import Pill from "./Pill";

export default function CurrentTime() {
	const getLocalTime = () => DateTime.local({ zone: "America/Los_Angeles" });
	const getFormattedTime = () =>
		getLocalTime().toLocaleString(DateTime.TIME_SIMPLE);
	const getFormattedDateTime = () =>
		getLocalTime().toLocaleString(DateTime.DATETIME_FULL);

	const [currentTime, setCurrentTime] = useState(getFormattedTime());
	const [currentDateTime, setCurrentDateTime] = useState(
		getFormattedDateTime(),
	);

	const updateTimes = () => {
		setCurrentTime(getFormattedTime());
		setCurrentDateTime(getFormattedDateTime());
	};

	const now = DateTime.now();
	const nextMinute = now.endOf("minute");
	const msToNextMinute = nextMinute.diff(now).milliseconds;

	useEffect(() => {
		let interval: NodeJS.Timeout | undefined;

		const timeout = setTimeout(() => {
			updateTimes();

			interval = setInterval(updateTimes, 60_000);
		}, msToNextMinute);

		return () => {
			if (interval) clearInterval(interval);
			clearTimeout(timeout);
		};
	}, []);

	return (
		<DialogTrigger>
			<Pill>
				<span className="i-mdi-clock-outline" />
				<span
					suppressHydrationWarning // time can be different based on the client's timezone
				>
					{currentTime}
				</span>
			</Pill>
			<DismissibleCard>
				<span>{currentDateTime}</span>
			</DismissibleCard>
		</DialogTrigger>
	);
}
