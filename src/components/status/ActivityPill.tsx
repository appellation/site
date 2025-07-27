import type { GatewayActivity } from "discord-api-types/v10";
import { DialogTrigger } from "react-aria-components";
import FloatingCard from "../FloatingCard";
import GameCard from "./GameCard";
import Pill from "./Pill";

function makeAssetUrl(appId: string, assetId: string): string {
	return `https://cdn.discordapp.com/app-assets/${appId}/${assetId}.png`;
}

export type ActivityPillProps = {
	readonly activity: GatewayActivity;
};

export default function ActivityPill(props: ActivityPillProps) {
	return (
		<DialogTrigger>
			<Pill>
				{props.activity.application_id && props.activity.assets?.small_image ? (
					<img
						className="h-6 w-6 rounded-full"
						src={makeAssetUrl(
							props.activity.application_id,
							props.activity.assets.small_image,
						)}
					/>
				) : null}
				<p className="w-full truncate">{props.activity.name}</p>
			</Pill>

			<FloatingCard>
				<GameCard activity={props.activity} />
			</FloatingCard>
		</DialogTrigger>
	);
}
