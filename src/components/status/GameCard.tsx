import type { GatewayActivity } from "discord-api-types/v10";

function makeAssetUrl(appId: string, assetId: string): string {
	return `https://cdn.discordapp.com/app-assets/${appId}/${assetId}.png`;
}

export type Props = {
	readonly activity: GatewayActivity;
};

export default function GameCard(props: Props) {
	return (
		<div className="flex items-start bg-white dark:bg-black rounded-lg">
			{props.activity.application_id && props.activity.assets?.large_image ? (
				<div className="mr-2 relative">
					<img
						className="rounded h-18 w-18"
						src={makeAssetUrl(
							props.activity.application_id!,
							props.activity.assets!.large_image!,
						)}
					/>
					{props.activity.assets?.small_image ? (
						<img
							className="absolute bottom-[-0.25rem] right-[-0.25rem] h-6 w-6 rounded-full border-3 border-white dark:border-black"
							src={makeAssetUrl(
								props.activity.application_id!,
								props.activity.assets!.small_image!,
							)}
						/>
					) : null}
				</div>
			) : null}
			<div className="flex flex-col">
				<span className="font-bold">{props.activity.name}</span>
				{props.activity.details ? <p>{props.activity.details}</p> : null}
				{props.activity.state ? <p>{props.activity.state}</p> : null}
			</div>
		</div>
	);
}
