import type { GatewayActivity } from 'discord-api-types/v10';
import { createEffect, onCleanup } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

export interface Timestamps {
	start: number;
	end: number;
}

export interface Presence {
	active_on_discord_mobile: boolean;
	active_on_discord_desktop: boolean;
	listening_to_spotify: boolean;
	kv: Record<string, string>;
	spotify?: Spotify;
	discord_user: DiscordUser;
	discord_status: string;
	activities: GatewayActivity[];
}

export interface Spotify {
	track_id: string;
	timestamps: Timestamps;
	song: string;
	artist: string;
	album_art_url: string;
	album: string;
}

export interface DiscordUser {
	username: string;
	public_flags: number;
	id: string;
	discriminator: string;
	avatar: string;
}

enum OpCode {
	Event,
	Hello,
	Initialize,
	Heartbeat,
}

interface BasePacket<O extends OpCode, D = unknown> {
	op: O,
	d: D,
}

interface Packet<O extends OpCode, D = unknown> extends BasePacket<O, D> {
	seq: number;
}

interface EventPacket<T extends string | undefined = string, D = unknown> extends Packet<OpCode.Event, D> {
	t: T;
}

type InitializePacket = BasePacket<OpCode.Initialize, { subscribe_to_ids: string[] }>;
type HelloPacket = Packet<OpCode.Hello, { heartbeat_interval: number }>;
type InitStatePacket = EventPacket<'INIT_STATE', Record<string, Presence>>;
type PresenceUpdatePacket = EventPacket<'PRESENCE_UPDATE', Presence>;

type IncomingPacket = HelloPacket | InitStatePacket | PresenceUpdatePacket;

export default function useLanyard(userId: string): Partial<Presence> {
	const [data, setData] = createStore<Partial<Presence>>({});

	createEffect(() => {
		const socket = new WebSocket('wss://api.lanyard.rest/socket');
		let heartbeatInterval: NodeJS.Timer | number | null = null;

		socket.addEventListener('message', event => {
			const message: IncomingPacket = JSON.parse(event.data);
			switch (message.op) {
				case OpCode.Hello:
					if (heartbeatInterval) clearInterval(heartbeatInterval);
					heartbeatInterval = setInterval(() => socket.send("{\"op\":3}"), message.d.heartbeat_interval);
					break;
				case OpCode.Event: {
					switch (message.t) {
						case 'INIT_STATE':
							setData(reconcile(Object.values(message.d)[0]));
							break;
						case 'PRESENCE_UPDATE':
							setData(reconcile(message.d));
							break;
					}
					break;
				}
			}
		});

		socket.addEventListener('open', () => {
			const packet: InitializePacket = {
				op: 2,
				d: {
					subscribe_to_ids: [userId],
				},
			};

			socket.send(JSON.stringify(packet));
		});

		onCleanup(() => {
			socket.close();
			if (heartbeatInterval) clearInterval(heartbeatInterval);
		});
	});

	return data;
}
