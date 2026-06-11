class_name MovableComponent extends BaseComponent

@export var isTeleporting = false

@export var prevPosition: Vector2i = Vector2i(0, 0)

func _ready() -> void:
	super()
	prevPosition = entity.tilePosition

func setPosition(p: Vector2i, prev = null):
	if prev:
		prevPosition = prev
	else:
		prevPosition = entity.tilePosition

	entity.set_tile_position(p)

	var d = entity.tilePosition - prevPosition
	if d.length_squared() > 1.2:
		isTeleporting = true
	else:
		isTeleporting = false

# Runs every step
func step():
	if isTeleporting:
		isTeleporting = false

# Runs every animation frame
func animate(t: float): # t = 0..1
	var _sprite = entity.get_sprite()

	var LEDGE = 0.2
	t = min(t / LEDGE, 1)

	# TODO: make prettier teleport animation
	if isTeleporting:
		t = 1

	# вот эта хуйня мне не нравится
	var tilePosition = entity.tilePosition
	var p = (tilePosition - prevPosition) * (1 - t)
	_sprite.position = -p * Constants.TILE_SIZE
