use bevy::{
	log::{Level, LogPlugin},
	prelude::*,
	DefaultPlugins,
};
use config::{update_config, Config};
use game::{keyboard_input, setup_game, touch_input, GameOverEvent};
use grid::{position_translation, size_scaling, Position, Size};
use snake::{GrowthEvent, Segments, Tail};
use wasm_bindgen::prelude::wasm_bindgen;

mod config;
mod food;
mod game;
mod grid;
mod snake;

fn setup(mut commands: Commands) {
	commands.spawn(Camera2dBundle::default());
}

#[wasm_bindgen]
pub fn main(selector: String) {
	console_error_panic_hook::set_once();

	App::new()
		.add_plugins(
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
				}),
		)
		.insert_resource(ClearColor(Color::WHITE))
		.insert_resource(Segments::default())
		.insert_resource(Tail::default())
		.insert_resource(Config)
		.add_event::<GrowthEvent>()
		.add_event::<GameOverEvent>()
		.add_startup_system(setup)
		.add_startup_system(setup_game)
		.add_system(update_config)
		.add_system(keyboard_input.before(snake::movement))
		.add_system(touch_input.before(snake::movement))
		.add_system_set(game::system_set())
		.add_system_set_to_stage(
			CoreStage::PostUpdate,
			SystemSet::new()
				.with_system(position_translation)
				.with_system(size_scaling),
		)
		.run();
}

#[wasm_bindgen]
pub fn set_is_dark_mode(is_dark_mode: bool) {
	Config.set_is_dark_mode(is_dark_mode)
}
