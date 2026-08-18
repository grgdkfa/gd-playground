class_name Knight extends RigidBody2D

@onready var sprite: AnimatedSprite2D = $"sprite"

@export var power: float = 100

var v: Vector2 = Vector2(0, 0)

var timer: float = 0

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	lock_rotation = true


# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta: float) -> void:
func _physics_process(_delta: float) -> void:
	timer += _delta
	
	v = Vector2(0, 0)
	
	if Input.is_action_pressed("up"):
		v += Vector2(0, -1)
	if Input.is_action_pressed("right"):
		v += Vector2(1, 0)
	if Input.is_action_pressed("down"):
		v += Vector2(0, 1)
	if Input.is_action_pressed("left"):
		v += Vector2(-1, 0)
		
	v = v.normalized()
	
	if not v.is_equal_approx(Vector2(0, 0)):
		pass
		#print(v)
	
	apply_central_force(v * power)
	
	if (linear_velocity.length() > 0.01):
		var a = atan2(linear_velocity.y, linear_velocity.x)
		a = a / 3.1415
		#a = floor((a + 3.1415 / 16) * 8 / 3.1415)
		var idx: int = (int(a) + 8) % 8
		if (int(timer * 100) % 10 == 0):
			print('A:', a)

func _draw() -> void:
	draw_line(Vector2(0, 0), v * 20, Color(255, 0, 0))
