use std::sync::atomic::{AtomicBool, Ordering};

use bevy::prelude::*;

static IS_DARK_MODE: AtomicBool = AtomicBool::new(false);

#[derive(Resource, Default, Clone, Copy)]
pub struct Config;

impl Config {
	pub fn set_is_dark_mode(&mut self, is_light_mode: bool) {
		IS_DARK_MODE.store(is_light_mode, Ordering::Relaxed);
	}

	pub fn get_is_dark_mode(&self) -> bool {
		IS_DARK_MODE.load(Ordering::Relaxed)
	}
}

pub fn update_config(config: Res<Config>, mut commands: Commands) {
	commands.insert_resource(ClearColor(if config.get_is_dark_mode() {
		Color::BLACK
	} else {
		Color::WHITE
	}))
}
