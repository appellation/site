use bevy::prelude::*;
use rand::random;

const ARENA_WIDTH: u32 = 10;
const ARENA_HEIGHT: u32 = 10;

#[derive(Component, Clone, PartialEq, Eq, Debug)]
pub struct Position {
	pub x: i32,
	pub y: i32,
}

impl Position {
	pub fn random() -> Self {
		Self {
			x: (random::<f32>() * ARENA_WIDTH as f32) as i32,
			y: (random::<f32>() * ARENA_HEIGHT as f32) as i32,
		}
	}

	pub fn is_out_of_bounds(&self) -> bool {
		self.x < 0 || self.y < 0 || self.x as u32 >= ARENA_WIDTH || self.y as u32 >= ARENA_HEIGHT
	}
}

#[derive(Component)]
pub struct Size {
	pub width: f32,
	pub height: f32,
}

pub fn size_scaling(windows: Res<Windows>, mut query: Query<(&Size, &mut Transform)>) {
	let window = windows.get_primary().unwrap();
	for (size, mut transform) in &mut query {
		transform.scale = Vec3::new(
			size.width / ARENA_WIDTH as f32 * window.width() as f32,
			size.height / ARENA_HEIGHT as f32 * window.height() as f32,
			1.0,
		);
	}
}

pub fn position_translation(windows: Res<Windows>, mut query: Query<(&Position, &mut Transform)>) {
	let window = windows.get_primary().unwrap();

	fn convert(pos: f32, bound_window: f32, bound_game: f32) -> f32 {
		let tile_size = bound_window / bound_game;
		pos / bound_game * bound_window - (bound_window / 2.) + (tile_size / 2.)
	}

	for (pos, mut transform) in query.iter_mut() {
		transform.translation = Vec3::new(
			convert(pos.x as f32, window.width() as f32, ARENA_WIDTH as f32),
			convert(pos.y as f32, window.height() as f32, ARENA_HEIGHT as f32),
			0.0,
		);
	}
}
