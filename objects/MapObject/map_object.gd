@tool
class_name MapObject extends Node2D

signal on_step()
signal on_animate(t: float)

@onready var sprite: Sprite2D = $sprite

@export var spriteId: int:
	set(newId):
		spriteId = newId
		if not is_inside_tree():
			return
		set_sprite_id(newId)
	get:
		return spriteId

@export var tilePosition: Vector2i = Vector2i(0, 0)

@export var canSleep: bool = true
@export var sleeping: bool = false

func _ready() -> void:
	if Engine.is_editor_hint():
		set_sprite_id(spriteId)
		set_notify_transform(true)
		print("Notify transform enabled for editor: ", self.name)
	else:
		set_sprite_id(spriteId)
		_update_tile_position()
		EventBus.global_step.connect(step)
		EventBus.global_frame.connect(animate)

func _notification(what):
	if what == NOTIFICATION_TRANSFORM_CHANGED:
		print("Transform changed for ", self.name)
		_update_tile_position()


func set_tile_position(p: Vector2i):
	position.x = p.x * Constants.TILE_SIZE
	position.y = p.y * Constants.TILE_SIZE
	tilePosition = p

func set_sprite_id(id: int):
	print('New sprite id:', id)
	sprite.frame = id

func get_sprite() -> Sprite2D:
	return sprite

func _update_tile_position():
	tilePosition = Vector2i(int(position.x / 16), int(position.y / 16))
	print("Updated tile position to ", tilePosition)

func step() -> void:
	if !sleeping:
		on_step.emit()

func animate(t: float) -> void:
	if !sleeping:
		on_animate.emit(t)
