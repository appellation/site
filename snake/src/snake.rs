use bevy::prelude::*;

use crate::{food::Food, game::GameOverEvent, Position, Size};

const SNAKE_HEAD_COLOR: Color = Color::DARK_GRAY;
const SNAKE_SEGMENT_COLOR: Color = Color::GRAY;
pub struct GrowthEvent;

#[derive(Component, PartialEq, Eq)]
pub enum Direction {
	Up,
	Down,
	Left,
	Right,
}

impl Direction {
	pub fn opposite(&self) -> Self {
		match self {
			Self::Up => Self::Down,
			Self::Down => Self::Up,
			Self::Left => Self::Right,
			Self::Right => Self::Left,
		}
	}
}

#[derive(Component)]
pub struct Head {
	pub direction: Option<Direction>,
}

#[derive(Bundle)]
pub struct HeadBundle {
	sprite_bundle: SpriteBundle,
	segment: Segment,
	head: Head,
	position: Position,
	size: Size,
}

impl HeadBundle {
	pub fn new() -> Self {
		Self {
			sprite_bundle: SpriteBundle {
				sprite: Sprite {
					color: SNAKE_HEAD_COLOR,
					..Default::default()
				},
				..Default::default()
			},
			segment: Segment,
			head: Head { direction: None },
			position: Position::random(),
			size: Size {
				width: 0.8,
				height: 0.8,
			},
		}
	}
}

#[derive(Resource, Default, Debug)]
pub struct Tail(pub Option<Position>);

#[derive(Component)]
pub struct Segment;

#[derive(Bundle)]
pub struct SegmentBundle {
	sprite_bundle: SpriteBundle,
	segment: Segment,
	position: Position,
	size: Size,
}

impl SegmentBundle {
	pub fn new(position: Position) -> Self {
		Self {
			sprite_bundle: SpriteBundle {
				sprite: Sprite {
					color: SNAKE_SEGMENT_COLOR,
					..Default::default()
				},
				..Default::default()
			},
			segment: Segment,
			position,
			size: Size {
				width: 0.8,
				height: 0.8,
			},
		}
	}
}

#[derive(Resource, Default)]
pub struct Segments(pub Vec<Entity>);

impl Segments {
	pub fn new(commands: &mut Commands) -> Self {
		Self(vec![commands.spawn(HeadBundle::new()).id()])
	}
}

pub fn movement(
	segments: Res<Segments>,
	mut heads: Query<(Entity, &Head)>,
	mut positions: Query<&mut Position>,
	mut tail: ResMut<Tail>,
	mut game_over_writer: EventWriter<GameOverEvent>,
) {
	*tail = Tail(Some(
		positions.get(*segments.0.last().unwrap()).unwrap().clone(),
	));

	if let Some((head_entity, head)) = heads.iter_mut().next() {
		let segment_positions = segments
			.0
			.iter()
			.map(|e| positions.get_mut(*e).unwrap().clone())
			.collect::<Vec<Position>>();

		let mut head_pos = positions.get_mut(head_entity).unwrap();

		match head.direction {
			Some(Direction::Left) => {
				head_pos.x -= 1;
			}
			Some(Direction::Right) => {
				head_pos.x += 1;
			}
			Some(Direction::Up) => {
				head_pos.y += 1;
			}
			Some(Direction::Down) => {
				head_pos.y -= 1;
			}
			None => return,
		};

		if head_pos.is_out_of_bounds() || segment_positions.contains(&head_pos) {
			game_over_writer.send(GameOverEvent);
			return;
		}

		segment_positions
			.iter()
			.zip(segments.0.iter().skip(1))
			.for_each(|(pos, segment)| {
				*positions.get_mut(*segment).unwrap() = pos.clone();
			});
	}
}

pub fn growth(
	mut commands: Commands,
	mut segments: ResMut<Segments>,
	growth_reader: EventReader<GrowthEvent>,
	tail: Res<Tail>,
) {
	if !growth_reader.is_empty() {
		growth_reader.clear();

		let position = tail.0.as_ref().cloned().unwrap_or(Position { x: 3, y: 3 });

		segments
			.0
			.push(commands.spawn(SegmentBundle::new(position)).id());
	}
}

pub fn eating(
	mut commands: Commands,
	mut growth_writer: EventWriter<GrowthEvent>,
	food_positions: Query<(Entity, &Position), With<Food>>,
	head_positions: Query<&Position, With<Head>>,
) {
	for head_pos in head_positions.iter() {
		for (ent, food_pos) in food_positions.iter() {
			if food_pos == head_pos {
				commands.entity(ent).despawn();
				growth_writer.send(GrowthEvent);
			}
		}
	}
}
