/* eslint sonarjs/no-nested-switch: "warn" */
import type { GatewayActivity } from "discord-api-types/v10";
import { createEffect, onCleanup } from "solid-js";
import { createStore, reconcile } from "solid-js/store";

export type Timestamps = {
	end: number;
	start: number;
};

export type Presence = {
	active_on_discord_desktop: boolean;
	active_on_discord_mobile: boolean;
	activities: GatewayActivity[];
	discord_status: string;
	discord_user: DiscordUser;
	kv: Record<string, string>;
	listening_to_spotify: boolean;
	spotify?: Spotify;
};

export type Spotify = {
	album: string;
	album_art_url: string;
	artist: string;
	song: string;
	timestamps: Timestamps;
	track_id: string;
};

export type DiscordUser = {
	avatar: string;
	discriminator: string;
	id: string;
	public_flags: number;
	username: string;
};

enum OpCode {
	Event,
	Hello,
	Initialize,
	Heartbeat,
}

type BasePacket<O extends OpCode, D = unknown> = {
	d: D;
	op: O;
};

type Packet<O extends OpCode, D = unknown> = BasePacket<O, D> & {
	seq: number;
};

type EventPacket<T extends string | undefined = string, D = unknown> = Packet<
	OpCode.Event,
	D
> & {
	t: T;
};

type InitializePacket = BasePacket<
	OpCode.Initialize,
	{ subscribe_to_ids: string[] }
>;
type HelloPacket = Packet<OpCode.Hello, { heartbeat_interval: number }>;
type InitStatePacket = EventPacket<"INIT_STATE", Record<string, Presence>>;
type PresenceUpdatePacket = EventPacket<"PRESENCE_UPDATE", Presence>;

type IncomingPacket = HelloPacket | InitStatePacket | PresenceUpdatePacket;

export default function useLanyard(userId: string): Partial<Presence> {
	const [data, setData] = createStore<Partial<Presence>>({});

	let cleanup = new AbortController();
	let socket: WebSocket | undefined;
	let heartbeatInterval: NodeJS.Timer | number | null = null;

	function connect() {
		cleanup = new AbortController();
		socket = new WebSocket("wss://api.lanyard.rest/socket");

		socket.addEventListener(
			"message",
			(event) => {
				const message: IncomingPacket = JSON.parse(event.data);
				switch (message.op) {
					case OpCode.Hello:
						if (heartbeatInterval) clearInterval(heartbeatInterval);
						heartbeatInterval = setInterval(
							() => socket?.send('{"op":3}'),
							message.d.heartbeat_interval
						);
						break;
					case OpCode.Event: {
						switch (message.t) {
							case "INIT_STATE":
								setData(Object.values(message.d)[0]);
								break;
							case "PRESENCE_UPDATE":
								setData(reconcile(message.d, { merge: true }));
								break;
						}

						break;
					}
				}
			},
			{ signal: cleanup.signal }
		);

		socket.addEventListener(
			"open",
			() => {
				const packet: InitializePacket = {
					op: 2,
					// eslint-disable-next-line id-length
					d: {
						subscribe_to_ids: [userId],
					},
				};

				socket?.send(JSON.stringify(packet));
			},
			{ signal: cleanup.signal }
		);

		socket.addEventListener(
			"close",
			() => {
				cleanup.abort();
				connect();
			},
			{ signal: cleanup.signal }
		);
	}

	onCleanup(() => {
		socket?.close();
		cleanup.abort();
		if (heartbeatInterval) clearInterval(heartbeatInterval);
	});

	createEffect(connect);

	return data;
}
