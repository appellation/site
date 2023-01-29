import { createEffect, createSignal, onCleanup } from 'solid-js';

const [isInit, setIsInit] = createSignal(false);
const [iframeApi, setIframeApi] = createSignal<any>();

export interface SpotifyEmbedProps {
	trackId: string;
	seconds(): number;
}

export default function SpotifyEmbed(props: SpotifyEmbedProps) {
	const [frame, setFrame] = createSignal<HTMLDivElement>();
	const [controller, setController] = createSignal<any>();

	const callback = (EmbedController: any) => {
		EmbedController.addListener('ready', () => {
			setController(ex => ex || EmbedController);
		});

		onCleanup(() => EmbedController.destroy());
	};

	createEffect(() => controller()?.loadUri(`spotify:track:${props.trackId}`));

	if (typeof window !== 'undefined' && !isInit()) {
		setIsInit(true);

		(window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
			setIframeApi(IFrameAPI);
		};

		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://open.spotify.com/embed-podcast/iframe-api/v1';
		document.body.appendChild(script);
	}

	const options = { uri: `spotify:track:${props.trackId}` };
	createEffect(() => {
		if (frame()) {
			iframeApi()?.createController(frame(), options, callback);
		}
	});

	return <div ref={setFrame} />;
}
