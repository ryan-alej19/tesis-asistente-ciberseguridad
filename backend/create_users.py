from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@test.com', 'admin123', role='admin')
    print("Superuser 'admin' created.")

if not User.objects.filter(username='analyst').exists():
    u = User.objects.create_user('analyst', 'analyst@test.com', 'analyst123')
    u.role = 'analyst'
    u.save()
    print("User 'analyst' created.")

if not User.objects.filter(username='empleado').exists():
    u = User.objects.create_user('empleado', 'employee@test.com', 'empleado123')
    u.role = 'employee'
    u.save()
    print("User 'empleado' created.")
