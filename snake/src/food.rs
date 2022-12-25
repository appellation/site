use bevy::prelude::*;

use crate::{
	grid::{Position, Size},
	snake::GrowthEvent,
};

const FOOD_COLOR: Color = Color::RED;

#[derive(Component)]
pub struct Food;

#[derive(Bundle)]
pub struct FoodBundle {
	sprite_bundle: SpriteBundle,
	food: Food,
	position: Position,
	size: Size,
}

impl FoodBundle {
	pub fn new() -> Self {
		Self {
			sprite_bundle: SpriteBundle {
				sprite: Sprite {
					color: FOOD_COLOR,
					..Default::default()
				},
				..Default::default()
			},
			food: Food,
			position: Position::random(),
			size: Size {
				width: 0.5,
				height: 0.5,
			},
		}
	}
}

pub fn spawn(mut commands: Commands, mut growth_reader: EventReader<GrowthEvent>) {
	if growth_reader.iter().next().is_some() {
		commands.spawn(FoodBundle::new());
	}
}
