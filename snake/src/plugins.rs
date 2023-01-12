use bevy::{
	app::PluginGroupBuilder,
	log::{Level, LogPlugin},
	prelude::*,
};

pub fn app_plugins(selector: String) -> PluginGroupBuilder {
	DefaultPlugins
		.build()
		.set(WindowPlugin {
			window: WindowDescriptor {
				canvas: Some(selector),
				fit_canvas_to_parent: true,
				..Default::default()
			},
			..Default::default()
		})
		.set(LogPlugin {
			level: if cfg!(debug_assertions) {
				Level::DEBUG
			} else {
				Level::ERROR
			},
			..Default::default()
		})
}
